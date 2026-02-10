export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const currentGpa = data.currentGpa || 0;
    const creditsCompleted = data.creditsCompleted || 0;
    const remainingCredits = data.remainingCredits || 0;
    const targetGpa = data.targetGpa || 0;

    // Validation
    if (currentGpa < 0 || currentGpa > 4.0) {
      return new Response(
        JSON.stringify({ error: "Current GPA must be between 0 and 4.0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (creditsCompleted < 0) {
      return new Response(
        JSON.stringify({ error: "Credits completed must be greater than or equal to 0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (remainingCredits <= 0) {
      return new Response(
        JSON.stringify({ error: "Remaining credits must be greater than 0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (targetGpa < 0 || targetGpa > 4.0) {
      return new Response(
        JSON.stringify({ error: "Target GPA must be between 0 and 4.0" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate required GPA for remaining credits
    const totalCredits = creditsCompleted + remainingCredits;
    const requiredTotalPoints = targetGpa * totalCredits;
    const currentPoints = currentGpa * creditsCompleted;
    const requiredRemainingPoints = requiredTotalPoints - currentPoints;
    const requiredGpa = requiredRemainingPoints / remainingCredits;

    const feasibility = requiredGpa <= 4.0 ? "Possible" : "Impossible";

    // Calculate grade combinations needed
    const gradeCombinations = [];

    if (requiredGpa <= 4.0) {
      // All A scenario
      gradeCombinations.push({
        description: "All A",
        grades: { A: remainingCredits }
      });

      // Mix of A and B+ scenario (if applicable)
      if (requiredGpa < 4.0) {
        const bPlusCredits = Math.ceil((4.0 - requiredGpa) * remainingCredits / 0.5);
        const aCredits = remainingCredits - bPlusCredits;

        if (bPlusCredits <= remainingCredits) {
          gradeCombinations.push({
            description: `${aCredits} credits of A and ${bPlusCredits} credits of B+`,
            grades: { A: aCredits, "B+": bPlusCredits }
          });
        }
      }

      // Mix of B+ and B scenario (if applicable)
      if (requiredGpa <= 3.5) {
        const bCredits = Math.ceil((3.5 - requiredGpa) * remainingCredits / 0.5);
        const bPlusCredits = remainingCredits - bCredits;

        if (bCredits <= remainingCredits) {
          gradeCombinations.push({
            description: `${bPlusCredits} credits of B+ and ${bCredits} credits of B`,
            grades: { "B+": bPlusCredits, B: bCredits }
          });
        }
      }
    }

    const result = {
      feasibility,
      requiredGpa: Math.round(requiredGpa * 100) / 100,
      gradeFlexibility: Math.round((remainingCredits / totalCredits) * 10000) / 100,
      gradeImpact: Math.round((remainingCredits / totalCredits) * 10000) / 100,
      gradeCombinations
    };

    if (requiredGpa > 4.0) {
      // Calculate extra credits needed with all A grades
      const extraCreditsNeeded = Math.ceil((requiredRemainingPoints - 4.0 * remainingCredits) / 4.0);
      result.extraCreditsNeeded = extraCreditsNeeded;
      result.extraCreditStrategy = `You need ${extraCreditsNeeded} additional credits with A grades beyond graduation requirements`;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
