require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

// Admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Initialize Groq AI client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, monthlyIncome } = req.body;

    console.log('Signup request:', { email, fullName, monthlyIncome });

    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Email, password, and full name are required' 
      });
    }

    // Sign up with Supabase Auth (disable email confirmation for demo)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          monthly_income: monthlyIncome || '₹50,000'
        },
        emailRedirectTo: undefined
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Signup successful:', data.user?.email);

    // Save income to user_profiles table immediately after signup
    if (data.user) {
      const incomeValue = parseFloat(String(monthlyIncome).replace(/[₹,]/g, '')) || 0;
      try {
        await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            monthly_income: incomeValue,
            currency: 'INR',
            updated_at: new Date().toISOString()
          });
        console.log('✅ Profile saved for new user, income:', incomeValue);
      } catch (profileError) {
        console.error('Profile save error (non-fatal):', profileError);
      }
    }

    res.status(201).json({ 
      message: 'Account created successfully! You can now log in.',
      user: data.user,
      needsConfirmation: !data.session
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error.message);
      return res.status(401).json({ error: 'Invalid email or password. Make sure your account is confirmed.' });
    }

    console.log('Login successful:', data.user.email);

    // Also ensure user_profiles has the income from user_metadata
    if (data.user) {
      const metaIncome = data.user.user_metadata?.monthly_income;
      if (metaIncome) {
        const incomeValue = parseFloat(String(metaIncome).replace(/[₹,]/g, '')) || 0;
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('id, monthly_income')
            .eq('id', data.user.id)
            .single();

          // Only upsert if no profile or income is 0
          if (!existingProfile || !existingProfile.monthly_income) {
            await supabaseAdmin
              .from('user_profiles')
              .upsert({
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || '',
                monthly_income: incomeValue,
                currency: 'INR',
                updated_at: new Date().toISOString()
              });
            console.log('✅ Profile synced on login, income:', incomeValue);
          }
        } catch (profileError) {
          console.error('Profile sync error (non-fatal):', profileError.message);
        }
      }
    }

    res.status(200).json({ 
      message: 'Login successful!',
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Assistant endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('AI Chat request:', message);

    // Build context about user's finances
    const financialContext = userData ? `
User's Financial Profile:
- Monthly Income: ${userData.income || '₹50,000'}
- Current Month Expenses: ${userData.expenses || '₹32,400'}
- Savings: ${userData.savings || '₹17,600'}
- Savings Rate: ${userData.savingsRate || '35.2%'}
- Top Spending Category: ${userData.topCategory || 'Shopping - ₹12,400'}
- Financial Health Score: ${userData.healthScore || '78/100'}

Recent Transactions:
${userData.transactions || '- Salary - Sept: ₹40,000\n- Zomato - Biryani: ₹320\n- Netflix, monthly: ₹649\n- Big Bazaar - Shopping: ₹4,180\n- Reliance Digital: ₹12,400'}
    ` : 'No financial data available yet.';

    // Create AI prompt
    const systemPrompt = `You are Khata, an AI personal finance manager and advisor. You help users understand their spending, save money, and make better financial decisions.

Your personality:
- Friendly, supportive, and knowledgeable
- Use simple language, avoid jargon
- Give practical, actionable advice
- Be encouraging but honest about financial habits
- Use Indian currency (₹) and context
- Keep responses concise (2-3 paragraphs max)

${financialContext}

Guidelines:
- Analyze spending patterns and suggest improvements
- Help with budgeting and saving goals
- Predict future expenses based on current trends
- Flag unusual spending or potential issues
- Provide specific, actionable recommendations
- Reference actual numbers from the user's data`;

    // Call Groq API with current working model
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process that request.';

    console.log('AI Response generated');

    res.status(200).json({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: error.message 
    });
  }
});

// ===================== DATABASE ENDPOINTS =====================

// Helper: extract user ID from JWT token without strict clock validation
function getUserIdFromToken(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
    return payload.sub || null; // 'sub' is the user ID in Supabase JWTs
  } catch (e) {
    console.error('Token decode error:', e.message);
    return null;
  }
}

// Get user profile
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ profile: null });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.json({ profile: null });

    const { data, error } = await supabaseAdmin
      .from('user_profiles').select('*').eq('id', userId).single();

    let profile = (!error) ? data : null;

    // Fallback: if no profile, try to get income from auth user metadata
    if (!profile || !profile.monthly_income) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const metaIncome = authData?.user?.user_metadata?.monthly_income;
        if (metaIncome) {
          const incomeValue = parseFloat(String(metaIncome).replace(/[₹,]/g, '')) || 0;
          const { data: upserted } = await supabaseAdmin.from('user_profiles').upsert({
            id: userId,
            full_name: authData.user.user_metadata?.full_name || '',
            monthly_income: incomeValue,
            currency: 'INR',
            updated_at: new Date().toISOString()
          }).select().single();
          profile = upserted || { id: userId, monthly_income: incomeValue };
          console.log('✅ Profile synced from metadata, income:', incomeValue);
        }
      } catch (e) { console.error('Meta fallback error:', e.message); }
    }

    res.json({ profile: profile || null });
  } catch (error) {
    console.error('Profile GET error:', error.message);
    res.json({ profile: null });
  }
});

// Update user profile
app.put('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const { full_name, monthly_income, currency } = req.body;
    const { data, error } = await supabaseAdmin.from('user_profiles').upsert({
      id: userId, full_name, monthly_income,
      currency: currency || 'INR',
      updated_at: new Date().toISOString()
    }).select().single();

    if (error) return res.status(500).json({ error: 'Failed to update profile' });
    console.log('✅ Profile updated, income:', monthly_income);
    res.json({ profile: data });
  } catch (error) {
    console.error('Profile PUT error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ transactions: [] });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.json({ transactions: [] });

    const { data, error } = await supabaseAdmin
      .from('transactions').select('*').eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) { console.error('Transactions fetch error:', error); return res.json({ transactions: [] }); }
    console.log(`✅ Loaded ${data?.length || 0} transactions for user`);
    res.json({ transactions: data || [] });
  } catch (error) {
    console.error('Transactions GET error:', error.message);
    res.json({ transactions: [] });
  }
});

// Add transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const { date, merchant, description, category, amount, type } = req.body;
    const { data, error } = await supabaseAdmin.from('transactions').insert({
      user_id: userId, date, merchant, description,
      category, amount, type: type || 'expense'
    }).select().single();

    if (error) { console.error('Transaction insert error:', error); return res.status(500).json({ error: 'Failed to add transaction' }); }
    console.log('✅ Transaction saved:', merchant, amount);
    res.json({ transaction: data });
  } catch (error) {
    console.error('Transactions POST error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all goals
app.get('/api/goals', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ goals: [] });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.json({ goals: [] });

    const { data, error } = await supabaseAdmin
      .from('goals').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('Goals fetch error:', error); return res.json({ goals: [] }); }
    res.json({ goals: data || [] });
  } catch (error) {
    console.error('Goals GET error:', error.message);
    res.json({ goals: [] });
  }
});

// Add goal
app.post('/api/goals', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const { name, emoji, target_amount, current_amount, deadline } = req.body;
    const { data, error } = await supabaseAdmin.from('goals').insert({
      user_id: userId, name, emoji: emoji || '🎯',
      target_amount, current_amount: current_amount || 0, deadline
    }).select().single();

    if (error) { console.error('Goal insert error:', error); return res.status(500).json({ error: 'Failed to add goal' }); }
    console.log('✅ Goal saved:', name);
    res.json({ goal: data });
  } catch (error) {
    console.error('Goals POST error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ subscriptions: [] });
    const token = authHeader.replace('Bearer ', '');
    const userId = getUserIdFromToken(token);
    if (!userId) return res.json({ subscriptions: [] });

    const { data, error } = await supabaseAdmin
      .from('subscriptions').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('Subscriptions fetch error:', error); return res.json({ subscriptions: [] }); }
    res.json({ subscriptions: data || [] });
  } catch (error) {
    console.error('Subscriptions GET error:', error.message);
    res.json({ subscriptions: [] });
  }
});

// Add subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name, amount, frequency, next_billing_date, category } = req.body;

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        name,
        amount,
        frequency: frequency || 'monthly',
        next_billing_date,
        category
      })
      .select()
      .single();

    if (error) {
      console.error('Subscription insert error:', error);
      return res.status(500).json({ error: 'Failed to add subscription' });
    }

    res.json({ subscription: data });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server - listen locally, export for Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Khata server running on http://localhost:' + PORT);
  });
}

module.exports = app;
