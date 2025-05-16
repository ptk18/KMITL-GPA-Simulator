from flask import Flask, request, jsonify, render_template
import math

app = Flask(__name__)

# KMITL Grading Scale
GRADE_POINTS = {
    "A": 4.0,
    "B+": 3.5,
    "B": 3.0,
    "C+": 2.5,
    "C": 2.0,
    "D+": 1.5,
    "D": 1.0,
    "F": 0.0,
    "I": None,  # Incomplete - no grade points, no credit
    "S": None,  # Satisfied - no grade points, but has credit
    "U": None,  # Unsatisfied - no grade points, no credit (like fail)
    "T": None   # Transfer - no grade points, but has credit
}

# Grades that earn credits but don't affect GPA
CREDIT_ONLY_GRADES = ["S", "T"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate-gpa', methods=['POST'])
def calculate_gpa():
    data = request.json
    courses = data.get('courses', [])
    
    if not courses:
        return jsonify({"error": "No courses provided"}), 400
    
    total_credit_points = 0
    total_credits = 0
    non_gpa_credits = 0
    
    for course in courses:
        grade = course.get('grade')
        credits = course.get('credits', 0)
        
        if grade not in GRADE_POINTS:
            return jsonify({"error": f"Invalid grade: {grade}"}), 400
        
        if credits <= 0:
            return jsonify({"error": "Credits must be greater than 0"}), 400
        
        # Handle special grades (I, S, U, T)
        if grade in CREDIT_ONLY_GRADES:
            non_gpa_credits += credits
        elif GRADE_POINTS[grade] is not None:
            grade_point = GRADE_POINTS[grade]
            total_credit_points += grade_point * credits
            total_credits += credits
    
    if total_credits == 0:
        gpa = 0.0
    else:
        gpa = total_credit_points / total_credits
    
    total_earned_credits = total_credits + non_gpa_credits
    
    return jsonify({
        "gpa": round(gpa, 2),
        "totalCredits": total_credits,
        "nonGpaCredits": non_gpa_credits,
        "totalEarnedCredits": total_earned_credits
    })

@app.route('/api/gpa-goal-planner', methods=['POST'])
def gpa_goal_planner():
    data = request.json
    current_gpa = data.get('currentGpa', 0)
    credits_completed = data.get('creditsCompleted', 0)
    remaining_credits = data.get('remainingCredits', 0)
    target_gpa = data.get('targetGpa', 0)
    
    if current_gpa < 0 or current_gpa > 4.0:
        return jsonify({"error": "Current GPA must be between 0 and 4.0"}), 400
    
    if credits_completed < 0:
        return jsonify({"error": "Credits completed must be greater than or equal to 0"}), 400
    
    if remaining_credits <= 0:
        return jsonify({"error": "Remaining credits must be greater than 0"}), 400
    
    if target_gpa < 0 or target_gpa > 4.0:
        return jsonify({"error": "Target GPA must be between 0 and 4.0"}), 400
    
    # Calculate required GPA for remaining credits
    total_credits = credits_completed + remaining_credits
    required_total_points = target_gpa * total_credits
    current_points = current_gpa * credits_completed
    required_remaining_points = required_total_points - current_points
    required_gpa = required_remaining_points / remaining_credits
    
    feasibility = "Possible" if required_gpa <= 4.0 else "Impossible"
    
    # Calculate grade combinations needed
    grade_combinations = []
    
    if required_gpa <= 4.0:
        # All A scenario
        grade_combinations.append({
            "description": "All A",
            "grades": {"A": remaining_credits}
        })
        
        # Mix of A and B+ scenario (if applicable)
        if required_gpa < 4.0:
            b_plus_credits = math.ceil((4.0 - required_gpa) * remaining_credits / 0.5)
            a_credits = remaining_credits - b_plus_credits
            
            if b_plus_credits <= remaining_credits:
                grade_combinations.append({
                    "description": f"{a_credits} credits of A and {b_plus_credits} credits of B+",
                    "grades": {"A": a_credits, "B+": b_plus_credits}
                })
        
        # Mix of B+ and B scenario (if applicable)
        if required_gpa <= 3.5:
            b_credits = math.ceil((3.5 - required_gpa) * remaining_credits / 0.5)
            b_plus_credits = remaining_credits - b_credits
            
            if b_credits <= remaining_credits:
                grade_combinations.append({
                    "description": f"{b_plus_credits} credits of B+ and {b_credits} credits of B",
                    "grades": {"B+": b_plus_credits, "B": b_credits}
                })
    
    result = {
        "feasibility": feasibility,
        "requiredGpa": round(required_gpa, 2),
        "gradeFlexibility": round((remaining_credits / total_credits) * 100, 2),
        "gradeImpact": round((remaining_credits / total_credits) * 100, 2),
        "gradeCombinations": grade_combinations
    }
    
    if required_gpa > 4.0:
        # Calculate extra credits needed with all A grades
        extra_credits_needed = math.ceil((required_remaining_points - 4.0 * remaining_credits) / 4.0)
        result["extraCreditsNeeded"] = extra_credits_needed
        result["extraCreditStrategy"] = f"You need {extra_credits_needed} additional credits with A grades beyond graduation requirements"
    
    return jsonify(result)

@app.route('/api/what-if-simulator', methods=['POST'])
def what_if_simulator():
    data = request.json
    current_gpa = data.get('currentGpa', 0)
    credits_completed = data.get('creditsCompleted', 0)
    future_courses = data.get('futureCourses', [])
    
    if current_gpa < 0 or current_gpa > 4.0:
        return jsonify({"error": "Current GPA must be between 0 and 4.0"}), 400
    
    if credits_completed < 0:
        return jsonify({"error": "Credits completed must be greater than or equal to 0"}), 400
    
    if not future_courses:
        return jsonify({"error": "No future courses provided"}), 400
    
    # Calculate future GPA
    future_credit_points = 0
    future_credits = 0
    future_non_gpa_credits = 0
    
    for course in future_courses:
        grade = course.get('grade')
        credits = course.get('credits', 0)
        
        if grade not in GRADE_POINTS:
            return jsonify({"error": f"Invalid grade: {grade}"}), 400
        
        if credits <= 0:
            return jsonify({"error": "Credits must be greater than 0"}), 400
        
        # Handle special grades (I, S, U, T)
        if grade in CREDIT_ONLY_GRADES:
            future_non_gpa_credits += credits
        elif GRADE_POINTS[grade] is not None:
            grade_point = GRADE_POINTS[grade]
            future_credit_points += grade_point * credits
            future_credits += credits
    
    # Calculate new GPA - if we're simulating a semester, only use future courses
    # This assumes we're calculating a term GPA, not a cumulative GPA
    # For term GPA, we don't include previous credits/GPA
    if data.get('calculationType') == 'term':
        if future_credits > 0:
            term_gpa = future_credit_points / future_credits
        else:
            term_gpa = 0
            
        # Now calculate the cumulative GPA including the term
        current_points = current_gpa * credits_completed
        total_points = current_points + future_credit_points
        total_gpa_credits = credits_completed + future_credits
        
        if total_gpa_credits > 0:
            cumulative_gpa = total_points / total_gpa_credits
        else:
            cumulative_gpa = 0
            
        gpa_change = cumulative_gpa - current_gpa
        
        return jsonify({
            "termGpa": round(term_gpa, 2),
            "cumulativeGpa": round(cumulative_gpa, 2),
            "gpaChange": round(gpa_change, 2),
            "gpaImpact": round((future_credits / total_gpa_credits) * 100, 2) if total_gpa_credits > 0 else 0,
            "futureCredits": future_credits,
            "futureNonGpaCredits": future_non_gpa_credits,
            "totalEarnedCredits": total_gpa_credits + future_non_gpa_credits
        })
    else:
        # Calculate cumulative GPA (original behavior)
        current_points = current_gpa * credits_completed
        total_points = current_points + future_credit_points
        total_gpa_credits = credits_completed + future_credits
        
        if total_gpa_credits > 0:
            new_gpa = total_points / total_gpa_credits
        else:
            new_gpa = 0
        
        # Calculate GPA impact
        gpa_change = new_gpa - current_gpa
        total_earned_credits = total_gpa_credits + future_non_gpa_credits
        
        return jsonify({
            "newGpa": round(new_gpa, 2),
            "gpaChange": round(gpa_change, 2),
            "gpaImpact": round((future_credits / total_gpa_credits) * 100, 2) if total_gpa_credits > 0 else 0,
            "futureCredits": future_credits,
            "futureNonGpaCredits": future_non_gpa_credits,
            "totalEarnedCredits": total_earned_credits
        })

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)