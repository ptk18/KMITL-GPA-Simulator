// KMITL Grading Scale
const GRADE_POINTS = {
  A: 4.0,
  "B+": 3.5,
  B: 3.0,
  "C+": 2.5,
  C: 2.0,
  "D+": 1.5,
  D: 1.0,
  F: 0.0,
  I: null,  // Incomplete - no grade points, no credit
  S: null,  // Satisfied - no grade points, but has credit
  U: null,  // Unsatisfied - no grade points, no credit (like fail)
  T: null   // Transfer - no grade points, but has credit
};

// Grades that earn credits but don't affect GPA
const CREDIT_ONLY_GRADES = ["S", "T"];

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const currentGpa = data.currentGpa || 0;
    const creditsCompleted = data.creditsCompleted || 0;
    const futureCourses = data.futureCourses || [];
    const calculationType = data.calculationType;

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

    if (!futureCourses || futureCourses.length === 0) {
      return new Response(
        JSON.stringify({ error: "No future courses provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate future GPA
    let futureCreditPoints = 0;
    let futureCredits = 0;
    let futureNonGpaCredits = 0;

    for (const course of futureCourses) {
      const grade = course.grade;
      const credits = course.credits || 0;

      if (!(grade in GRADE_POINTS)) {
        return new Response(
          JSON.stringify({ error: `Invalid grade: ${grade}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (credits <= 0) {
        return new Response(
          JSON.stringify({ error: "Credits must be greater than 0" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle special grades (I, S, U, T)
      if (CREDIT_ONLY_GRADES.includes(grade)) {
        futureNonGpaCredits += credits;
      } else if (GRADE_POINTS[grade] !== null) {
        const gradePoint = GRADE_POINTS[grade];
        futureCreditPoints += gradePoint * credits;
        futureCredits += credits;
      }
    }

    // Calculate new GPA - if we're simulating a semester, only use future courses
    if (calculationType === "term") {
      let termGpa = 0;
      if (futureCredits > 0) {
        termGpa = futureCreditPoints / futureCredits;
      }

      // Now calculate the cumulative GPA including the term
      const currentPoints = currentGpa * creditsCompleted;
      const totalPoints = currentPoints + futureCreditPoints;
      const totalGpaCredits = creditsCompleted + futureCredits;

      let cumulativeGpa = 0;
      if (totalGpaCredits > 0) {
        cumulativeGpa = totalPoints / totalGpaCredits;
      }

      const gpaChange = cumulativeGpa - currentGpa;

      return new Response(
        JSON.stringify({
          termGpa: Math.round(termGpa * 100) / 100,
          cumulativeGpa: Math.round(cumulativeGpa * 100) / 100,
          gpaChange: Math.round(gpaChange * 100) / 100,
          gpaImpact: totalGpaCredits > 0 ? Math.round((futureCredits / totalGpaCredits) * 10000) / 100 : 0,
          futureCredits,
          futureNonGpaCredits,
          totalEarnedCredits: totalGpaCredits + futureNonGpaCredits
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Calculate cumulative GPA (original behavior)
      const currentPoints = currentGpa * creditsCompleted;
      const totalPoints = currentPoints + futureCreditPoints;
      const totalGpaCredits = creditsCompleted + futureCredits;

      let newGpa = 0;
      if (totalGpaCredits > 0) {
        newGpa = totalPoints / totalGpaCredits;
      }

      // Calculate GPA impact
      const gpaChange = newGpa - currentGpa;
      const totalEarnedCredits = totalGpaCredits + futureNonGpaCredits;

      return new Response(
        JSON.stringify({
          newGpa: Math.round(newGpa * 100) / 100,
          gpaChange: Math.round(gpaChange * 100) / 100,
          gpaImpact: totalGpaCredits > 0 ? Math.round((futureCredits / totalGpaCredits) * 10000) / 100 : 0,
          futureCredits,
          futureNonGpaCredits,
          totalEarnedCredits
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
