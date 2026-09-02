const bcrypt = require('bcryptjs');

async function test() {
  const start = Date.now();
  const salt12 = await bcrypt.genSalt(12);
  const hash12 = await bcrypt.hash('password123', salt12);
  const mid1 = Date.now();
  await bcrypt.compare('password123', hash12);
  const mid2 = Date.now();
  
  const salt10 = await bcrypt.genSalt(10);
  const hash10 = await bcrypt.hash('password123', salt10);
  const mid3 = Date.now();
  await bcrypt.compare('password123', hash10);
  const end = Date.now();

  console.log(`12 Rounds: Hash took ${mid1 - start}ms, Compare took ${mid2 - mid1}ms`);
  console.log(`10 Rounds: Hash took ${mid3 - mid2}ms, Compare took ${end - mid3}ms`);
}

test();
