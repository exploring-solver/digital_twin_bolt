const supabase = require('../supabase/client');

async function logToSupabase(level, message) {
  try {
    await supabase.from('logs').insert([{
      timestamp: new Date().toISOString(),
      level,
      message
    }]);
  } catch (err) {
    console.error(`[ERROR] Failed to log to Supabase: ${err.message}`);
  }
}

module.exports = {
  info: async (msg) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`);
    await logToSupabase('info', msg);
  },
  error: async (msg) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
    await logToSupabase('error', msg);
  }
};
