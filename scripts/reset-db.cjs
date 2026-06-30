const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PB_DIR = path.resolve(__dirname, '..', 'pocketbase');
const PB_DATA_DIR = path.resolve(PB_DIR, 'pb_data');
const PB_EXE = path.resolve(PB_DIR, 'pocketbase.exe');

function run() {
  console.log('⏳ Stopping any running pocketbase processes...');
  try {
    execSync('taskkill /f /im pocketbase.exe', { stdio: 'ignore' });
  } catch (err) {
    // Ignore error if process is not running
  }

  // Sleep 1 second
  execSync('node -e "setTimeout(() => {}, 1000)"');

  console.log('⏳ Deleting old pb_data database folder...');
  if (fs.existsSync(PB_DATA_DIR)) {
    try {
      fs.rmSync(PB_DATA_DIR, { recursive: true, force: true });
      console.log('✅ Deleted pb_data successfully.');
    } catch (err) {
      console.error('❌ Failed to delete pb_data. File might still be locked:', err.message);
      process.exit(1);
    }
  }

  console.log('⏳ Starting PocketBase server...');
  const child = spawn(PB_EXE, ['serve', '--dir=pb_data'], {
    cwd: PB_DIR,
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  console.log('✅ PocketBase server started successfully in background on port 8090.');
  console.log('🎉 Reset complete! Please wait a couple seconds, create your admin account, and run setup-pb-schema.cjs.');
}

run();
