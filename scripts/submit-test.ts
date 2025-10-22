import { drizzle } from 'drizzle-orm/mysql2';
import { candidates } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // Get all candidates
  const allCandidates = await db.select().from(candidates);
  const latestCandidate = allCandidates[0];

  if (latestCandidate) {
    // Submit the test with a score
    await db.update(candidates)
      .set({
        completedAt: new Date(),
        score: '15'
      })
      .where(eq(candidates.id, latestCandidate.id));
    
    console.log('Test submitted for candidate:', latestCandidate.name);
    console.log('Candidate ID:', latestCandidate.id);
    console.log('Score: 15/21');
  }
}

main();

