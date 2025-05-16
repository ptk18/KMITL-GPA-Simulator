// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const mobileTabButtons = document.querySelectorAll('.mobile-tab-button');
    
    // Mobile Menu Elements
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('overlay');

    // Course Management
    const addCalculatorCourseBtn = document.getElementById('add-calculator-course');
    const addSimulatorCourseBtn = document.getElementById('add-simulator-course');
    const calculatorCoursesList = document.getElementById('calculator-courses');
    const simulatorCoursesList = document.getElementById('simulator-courses');

    // Form Buttons
    const calculateGpaBtn = document.getElementById('calculate-gpa');
    const planGpaBtn = document.getElementById('plan-gpa');
    const simulateGpaBtn = document.getElementById('simulate-gpa');

    // Result Containers
    const calculatorResult = document.getElementById('calculator-result');
    const plannerResult = document.getElementById('planner-result');
    const simulatorResult = document.getElementById('simulator-result');
    
    // Mobile Menu Toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileSidebar.classList.toggle('open');
            overlay.style.display = mobileSidebar.classList.contains('open') ? 'block' : 'none';
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            mobileSidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }

    // Initialize Tab Navigation
    function switchTab(tabId) {
        // Remove active class from all buttons and panes
        tabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        mobileTabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        tabPanes.forEach(function(pane) {
            pane.classList.remove('active');
        });
        
        // Add active class to the selected button and pane
        const desktopButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const mobileButton = document.querySelector(`.mobile-tab-button[data-tab="${tabId}"]`);
        const pane = document.getElementById(tabId);
        
        if (desktopButton) desktopButton.classList.add('active');
        if (mobileButton) mobileButton.classList.add('active');
        if (pane) pane.classList.add('active');
        
        // Special handling for About tab
        if (tabId === 'about') {
            checkLateNight();
        }
        
        // Close mobile sidebar after tab selection
        if (mobileSidebar) {
            mobileSidebar.classList.remove('open');
        }
        
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    // Late night message
    function checkLateNight() {
        const hour = new Date().getHours();
        const lateNightMessage = document.querySelector('.late-night-message');
        if (lateNightMessage) {
            if (hour >= 22 || hour < 6) {
                lateNightMessage.style.display = 'inline';
            } else {
                lateNightMessage.style.display = 'none';
            }
        }
    }
    
    // Add click handlers to tab buttons
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    mobileTabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Course Management
    function createCourseEntry() {
        const courseEntry = document.createElement('div');
        courseEntry.className = 'course-entry';
        
        const gradeSelect = document.createElement('select');
        gradeSelect.className = 'grade-select';
        
        const grades = [
            { value: 'A', text: 'A' },
            { value: 'B+', text: 'B+' },
            { value: 'B', text: 'B' },
            { value: 'C+', text: 'C+' },
            { value: 'C', text: 'C' },
            { value: 'D+', text: 'D+' },
            { value: 'D', text: 'D' },
            { value: 'F', text: 'F' },
            { value: 'I', text: 'I (Incomplete)' },
            { value: 'S', text: 'S (Satisfied)' },
            { value: 'U', text: 'U (Unsatisfied)' },
            { value: 'T', text: 'T (Transfer)' }
        ];
        
        grades.forEach(function(grade) {
            const option = document.createElement('option');
            option.value = grade.value;
            option.textContent = grade.text;
            gradeSelect.appendChild(option);
        });
        
        const creditInput = document.createElement('input');
        creditInput.type = 'number';
        creditInput.className = 'credit-input';
        creditInput.placeholder = 'Credits';
        creditInput.min = '1';
        creditInput.value = '3';
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-course';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.addEventListener('click', function() {
            courseEntry.remove();
        });
        
        courseEntry.appendChild(gradeSelect);
        courseEntry.appendChild(creditInput);
        courseEntry.appendChild(removeButton);
        
        return courseEntry;
    }

    // Add course entry buttons
    if (addCalculatorCourseBtn) {
        addCalculatorCourseBtn.addEventListener('click', function() {
            calculatorCoursesList.appendChild(createCourseEntry());
        });
    }
    
    if (addSimulatorCourseBtn) {
        addSimulatorCourseBtn.addEventListener('click', function() {
            simulatorCoursesList.appendChild(createCourseEntry());
        });
    }

    // Remove course buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-course')) {
            e.target.closest('.course-entry').remove();
        }
    });

    // GPA Calculator
    if (calculateGpaBtn) {
        calculateGpaBtn.addEventListener('click', async function() {
            const courses = [];
            const courseEntries = calculatorCoursesList.querySelectorAll('.course-entry');
            
            courseEntries.forEach(function(entry) {
                const grade = entry.querySelector('.grade-select').value;
                const credits = parseFloat(entry.querySelector('.credit-input').value);
                
                if (!isNaN(credits) && credits > 0) {
                    courses.push({ grade, credits });
                }
            });
            
            if (courses.length === 0) {
                alert('Please add at least one course.');
                return;
            }
            
            try {
                const response = await fetch('/api/calculate-gpa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courses })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    calculatorResult.innerHTML = `
                        <h3>Your GPA Results</h3>
                        <div class="gpa-display">${data.gpa.toFixed(2)}</div>
                        <p>GPA-affecting Credits: ${data.totalCredits}</p>
                        ${data.nonGpaCredits > 0 ? `<p>Non-GPA Credits (S, T): ${data.nonGpaCredits}</p>` : ''}
                        <p>Total Earned Credits: ${data.totalEarnedCredits}</p>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>GPA</span>
                                <span>${data.gpa.toFixed(2)} / 4.00</span>
                            </div>
                            <div class="progress-bar-outer">
                                <div class="progress-bar-inner" style="width: ${(data.gpa / 4) * 100}%"></div>
                            </div>
                        </div>
                        <div class="insight ${data.gpa >= 3.5 ? 'positive' : data.gpa >= 2.0 ? '' : 'negative'}">
                            <strong>GPA Insight:</strong> 
                            ${
                                data.gpa >= 3.5 ? 'Excellent! You have a strong GPA.' :
                                data.gpa >= 3.0 ? 'Good job! Your GPA is solid.' :
                                data.gpa >= 2.5 ? 'Your GPA is average. Consider improving in future courses.' :
                                data.gpa >= 2.0 ? 'Your GPA is acceptable but needs improvement.' :
                                'Warning: Your GPA is below the graduation requirement. Focus on improving.'
                            }
                        </div>
                        ${data.nonGpaCredits > 0 ? `
                        <div class="insight">
                            <strong>Note:</strong> You have ${data.nonGpaCredits} credits from S/T grades that count toward graduation but don't affect your GPA.
                        </div>
                        ` : ''}
                    `;
                    calculatorResult.classList.remove('hidden');
                } else {
                    throw new Error(data.error || 'Failed to calculate GPA');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // GPA Goal Planner
    if (planGpaBtn) {
        planGpaBtn.addEventListener('click', async function() {
            const currentGpa = parseFloat(document.getElementById('current-gpa').value);
            const creditsCompleted = parseInt(document.getElementById('credits-completed').value);
            const totalCredits = parseInt(document.getElementById('total-credits').value);
            const targetGpa = parseFloat(document.getElementById('target-gpa').value);
            
            // Calculate remaining credits
            const remainingCredits = totalCredits - creditsCompleted;
            
            if (isNaN(currentGpa) || isNaN(creditsCompleted) || isNaN(totalCredits) || isNaN(targetGpa)) {
                alert('Please enter valid numbers in all fields.');
                return;
            }
            
            if (remainingCredits <= 0) {
                alert('Total credits must be greater than credits completed.');
                return;
            }
            
            try {
                const response = await fetch('/api/gpa-goal-planner', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentGpa,
                        creditsCompleted,
                        remainingCredits,
                        targetGpa
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    let combinationsHtml = '';
                    
                    if (data.gradeCombinations && data.gradeCombinations.length > 0) {
                        combinationsHtml = `
                            <h4>Possible Grade Combinations</h4>
                            <ul>
                                ${data.gradeCombinations.map(function(combo) { 
                                    return `<li>${combo.description}</li>`;
                                }).join('')}
                            </ul>
                        `;
                    }
                    
                    const isPossible = data.feasibility === 'Possible';
                    
                    plannerResult.innerHTML = `
                        <h3>GPA Goal Analysis</h3>
                        <div class="insight ${isPossible ? '' : 'negative'}">
                            <strong>Feasibility:</strong> ${data.feasibility}
                            ${
                                isPossible 
                                    ? `<p>You need to maintain an average of <strong>${data.requiredGpa.toFixed(2)}</strong> in your remaining ${remainingCredits} credits.</p>` 
                                    : `<p>Your target GPA is not mathematically possible with regular credits.</p>`
                            }
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>GPA Flexibility</span>
                                <span>${data.gradeFlexibility.toFixed(2)}%</span>
                            </div>
                            <div class="progress-bar-outer">
                                <div class="progress-bar-inner" style="width: ${data.gradeFlexibility}%"></div>
                            </div>
                        </div>
                        
                        <p>Your remaining ${remainingCredits} credits affect <strong>${data.gradeImpact.toFixed(2)}%</strong> of your final GPA.</p>
                        
                        ${combinationsHtml}
                        
                        ${
                            !isPossible && data.extraCreditsNeeded
                                ? `
                                    <div class="insight warning">
                                        <strong>Extra Credit Strategy:</strong>
                                        <p>${data.extraCreditStrategy}</p>
                                    </div>
                                `
                                : ''
                        }
                        
                        <div class="insight">
                            <strong>Note about Special Grades:</strong>
                            <p>Remember that I, S, U, and T grades don't affect your GPA calculation. S and T grades count for credits but not GPA points.</p>
                        </div>
                    `;
                    
                    plannerResult.classList.remove('hidden');
                } else {
                    throw new Error(data.error || 'Failed to calculate GPA goal');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // What-If GPA Simulator
    if (simulateGpaBtn) {
        simulateGpaBtn.addEventListener('click', async function() {
            const currentGpa = parseFloat(document.getElementById('sim-current-gpa').value);
            const creditsCompleted = parseInt(document.getElementById('sim-credits-completed').value);
            const calculationType = document.getElementById('calculation-type').value;
            
            const futureCourses = [];
            const courseEntries = simulatorCoursesList.querySelectorAll('.course-entry');
            
            courseEntries.forEach(function(entry) {
                const grade = entry.querySelector('.grade-select').value;
                const credits = parseFloat(entry.querySelector('.credit-input').value);
                
                if (!isNaN(credits) && credits > 0) {
                    futureCourses.push({ grade, credits });
                }
            });
            
            if (futureCourses.length === 0) {
                alert('Please add at least one future course.');
                return;
            }
            
            try {
                const response = await fetch('/api/what-if-simulator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentGpa,
                        creditsCompleted,
                        futureCourses,
                        calculationType
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    if (calculationType === 'term') {
                        // Show term GPA results
                        const gpaChange = data.gpaChange;
                        const changeClass = gpaChange > 0 ? 'positive' : gpaChange < 0 ? 'negative' : 'neutral';
                        const changeIcon = gpaChange > 0 ? 'fa-arrow-up' : gpaChange < 0 ? 'fa-arrow-down' : 'fa-equals';
                        
                        simulatorResult.innerHTML = `
                            <h3>GPA Simulation Results</h3>
                            <div class="insight positive">
                                <strong>Term GPA:</strong> 
                                <div class="gpa-display">${data.termGpa.toFixed(2)}</div>
                            </div>
                            
                            <div class="insight">
                                <strong>Cumulative GPA:</strong>
                                <div class="gpa-display">${data.cumulativeGpa.toFixed(2)}</div>
                                
                                <div class="gpa-change ${changeClass}">
                                    <i class="fas ${changeIcon}"></i>
                                    ${Math.abs(gpaChange).toFixed(2)} points ${gpaChange > 0 ? 'increase' : gpaChange < 0 ? 'decrease' : 'no change'} from current ${currentGpa.toFixed(2)}
                                </div>
                            </div>
                            
                            <div class="progress-container">
                                <div class="progress-label">
                                    <span>GPA Progress</span>
                                    <span>${data.cumulativeGpa.toFixed(2)} / 4.00</span>
                                </div>
                                <div class="progress-bar-outer">
                                    <div class="progress-bar-inner" style="width: ${(data.cumulativeGpa / 4) * 100}%"></div>
                                </div>
                            </div>
                            
                            <div class="insight">
                                <strong>Credits Summary:</strong>
                                <p>Term Credits (affecting GPA): <strong>${data.futureCredits}</strong></p>
                                ${data.futureNonGpaCredits > 0 ? `<p>Term Credits (S, T grades): <strong>${data.futureNonGpaCredits}</strong></p>` : ''}
                                <p>Total Term Credits: <strong>${data.futureCredits + data.futureNonGpaCredits}</strong></p>
                                <p>Total Cumulative Credits: <strong>${data.totalEarnedCredits}</strong></p>
                            </div>
                        `;
                    } else {
                        // Show cumulative GPA results (original behavior)
                        const gpaChange = data.gpaChange;
                        const changeClass = gpaChange > 0 ? 'positive' : gpaChange < 0 ? 'negative' : 'neutral';
                        const changeIcon = gpaChange > 0 ? 'fa-arrow-up' : gpaChange < 0 ? 'fa-arrow-down' : 'fa-equals';
                        
                        simulatorResult.innerHTML = `
                            <h3>Simulated Future GPA</h3>
                            <div class="gpa-display">${data.newGpa.toFixed(2)}</div>
                            
                            <div class="gpa-change ${changeClass}">
                                <i class="fas ${changeIcon}"></i>
                                ${Math.abs(gpaChange).toFixed(2)} points ${gpaChange > 0 ? 'increase' : gpaChange < 0 ? 'decrease' : 'no change'}
                            </div>
                            
                            <div class="progress-container">
                                <div class="progress-label">
                                    <span>Current GPA: ${currentGpa.toFixed(2)}</span>
                                    <span>Future GPA: ${data.newGpa.toFixed(2)}</span>
                                </div>
                                <div class="progress-bar-outer">
                                    <div class="progress-bar-inner" style="width: ${(data.newGpa / 4) * 100}%"></div>
                                </div>
                            </div>
                            
                            <div class="insight">
                                <strong>Impact Analysis:</strong>
                                <p>These courses will affect <strong>${data.gpaImpact.toFixed(2)}%</strong> of your overall GPA.</p>
                                ${
                                    gpaChange > 0.2 ? '<p>These courses will significantly boost your GPA!</p>' :
                                    gpaChange > 0 ? '<p>These courses will slightly improve your GPA.</p>' :
                                    gpaChange < -0.2 ? '<p>Warning: These courses will significantly lower your GPA.</p>' :
                                    gpaChange < 0 ? '<p>These courses will slightly decrease your GPA.</p>' :
                                    '<p>These courses will maintain your current GPA.</p>'
                                }
                            </div>
                            
                            ${data.futureNonGpaCredits > 0 ? `
                            <div class="insight">
                                <strong>Special Grades:</strong>
                                <p>Your plan includes ${data.futureNonGpaCredits} credits from S/T grades that will count toward graduation but won't affect your GPA.</p>
                                <p>Total credits earned will be ${data.totalEarnedCredits}, with ${data.futureCredits} credits affecting GPA.</p>
                            </div>
                            ` : ''}
                        `;
                    }
                    
                    simulatorResult.classList.remove('hidden');
                } else {
                    throw new Error(data.error || 'Failed to simulate GPA');
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Input validation for numeric fields
document.addEventListener('DOMContentLoaded', function() {
    // Add validation for all numeric inputs
    const numericInputs = document.querySelectorAll('input[type="number"]');
    
    numericInputs.forEach(function(input) {
        // Validate on input change
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        // Validate on blur (when user leaves the field)
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Initial validation
        validateInput(input);
    });
    
    // Validate dynamically added inputs (for courses)
    document.addEventListener('click', function(e) {
        if (e.target.id === 'add-calculator-course' || e.target.id === 'add-simulator-course') {
            // Wait for the DOM to update
            setTimeout(function() {
                const newInputs = document.querySelectorAll('.credit-input:not(.validated)');
                newInputs.forEach(function(input) {
                    input.addEventListener('input', function() {
                        validateInput(this);
                    });
                    
                    input.addEventListener('blur', function() {
                        validateInput(this);
                    });
                    
                    input.classList.add('validated');
                    validateInput(input);
                });
            }, 100);
        }
    });
    
    // Validation function
    function validateInput(input) {
        const min = parseFloat(input.getAttribute('min') || 0);
        const max = parseFloat(input.getAttribute('max') || Infinity);
        const value = parseFloat(input.value);
        
        // Clear previous validation state
        input.classList.remove('invalid');
        input.classList.remove('valid');
        
        // Check if empty
        if (input.value === '') {
            return; // Skip validation for empty fields
        }
        
        // Check if not a number
        if (isNaN(value)) {
            input.classList.add('invalid');
            input.title = 'Please enter a valid number';
            return;
        }
        
        // Check min value
        if (value < min) {
            input.value = min;
            input.classList.add('valid');
            return;
        }
        
        // Check max value
        if (value > max) {
            input.value = max;
            input.classList.add('valid');
            return;
        }
        
        // For GPA fields specifically
        if (input.id.includes('gpa') && !isNaN(value)) {
            // Ensure we don't exceed 4.0
            if (value > 4.0) {
                input.value = 4.0;
            }
            
            // Format to 2 decimal places for display if needed
            if (input.value.indexOf('.') !== -1 && input.value.split('.')[1].length > 2) {
                input.value = parseFloat(input.value).toFixed(2);
            }
        }
        
        // For credit inputs in course lists
        if (input.classList.contains('credit-input')) {
            // Ensure we only use integers for credits
            if (value !== Math.floor(value)) {
                input.value = Math.floor(value);
            }
            
            // Ensure max is 4 and min is 0
            if (value > 4) {
                input.value = 4;
            } else if (value < 0) {
                input.value = 0;
            }
        }
        
        input.classList.add('valid');
    }
});
});