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

    // Course Management - New Calculator
    const addCourseBtn = document.getElementById('add-course-btn');
    const inputCourseName = document.getElementById('input-course-name');
    const inputCredits = document.getElementById('input-credits');
    const inputGrade = document.getElementById('input-grade');
    const coursesTbody = document.getElementById('courses-tbody');
    const coursesTableContainer = document.getElementById('courses-table-container');
    const gpaSummary = document.getElementById('gpa-summary');
    const gpaValue = document.getElementById('gpa-value');
    const creditsValue = document.getElementById('credits-value');
    const gpaActions = document.getElementById('gpa-actions');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const clearCoursesBtn = document.getElementById('clear-courses-btn');

    // Simulator Course Management
    const addSimulatorCourseBtn = document.getElementById('add-simulator-course');
    const simCourseName = document.getElementById('sim-course-name');
    const simCredits = document.getElementById('sim-credits');
    const simGrade = document.getElementById('sim-grade');
    const simCoursesTableContainer = document.getElementById('sim-courses-table-container');
    const simCoursesTbody = document.getElementById('sim-courses-tbody');

    // Form Buttons
    const planGpaBtn = document.getElementById('plan-gpa');
    const simulateGpaBtn = document.getElementById('simulate-gpa');

    // Result Containers
    const plannerResult = document.getElementById('planner-result');
    const simulatorResult = document.getElementById('simulator-result');

    // Courses data storage
    let courses = [];
    let editingIndex = null; // Track which course is being edited

    // Simulator courses data storage
    let simulatorCourses = [];
    
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

    // Grade points mapping
    const GRADE_POINTS = {
        'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0,
        'D+': 1.5, 'D': 1.0, 'F': 0.0, 'I': null, 'S': null, 'U': null, 'T': null
    };

    // Calculate and update GPA
    function calculateGPA() {
        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(function(course) {
            const gradePoint = GRADE_POINTS[course.grade];
            if (gradePoint !== null) {
                totalPoints += gradePoint * course.credits;
                totalCredits += course.credits;
            }
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

        if (gpaValue) gpaValue.textContent = gpa.toFixed(2);
        if (creditsValue) creditsValue.textContent = totalCredits;

        // Show/hide table and summary
        if (courses.length > 0) {
            if (coursesTableContainer) coursesTableContainer.classList.remove('hidden');
            if (gpaSummary) gpaSummary.classList.remove('hidden');
            if (gpaActions) gpaActions.classList.remove('hidden');
        } else {
            if (coursesTableContainer) coursesTableContainer.classList.add('hidden');
            if (gpaSummary) gpaSummary.classList.add('hidden');
            if (gpaActions) gpaActions.classList.add('hidden');
        }
    }

    // Render courses table
    function renderCoursesTable() {
        if (!coursesTbody) return;

        coursesTbody.innerHTML = courses.map(function(course, index) {
            return `<tr data-index="${index}">
                <td>${course.name || 'Unnamed Course'}</td>
                <td class="text-center">${course.credits}</td>
                <td class="text-center">${course.grade}</td>
                <td class="text-center">
                    <button class="btn-edit" data-index="${index}">Edit</button>
                    <button class="btn-delete" data-index="${index}">Delete</button>
                </td>
            </tr>`;
        }).join('');

        calculateGPA();
    }

    // Handle spinner buttons for number inputs
    document.querySelectorAll('.spinner-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const wrapper = this.closest('.number-input-wrapper');
            const input = wrapper.querySelector('input[type="number"]');
            const min = parseInt(input.min) || 1;
            const max = parseInt(input.max) || 4;
            let value = parseInt(input.value) || min;

            if (this.dataset.action === 'increment' && value < max) {
                input.value = value + 1;
            } else if (this.dataset.action === 'decrement' && value > min) {
                input.value = value - 1;
            }
        });
    });

    // Reset form to add mode
    function resetToAddMode() {
        editingIndex = null;
        inputCourseName.value = '';
        inputCredits.value = '3';
        inputGrade.value = 'A';
        addCourseBtn.textContent = 'Add';
        addCourseBtn.classList.remove('btn-update');
    }

    // Add/Update course
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', function() {
            const name = inputCourseName.value.trim();
            const credits = parseInt(inputCredits.value);
            const grade = inputGrade.value;

            if (credits < 1 || credits > 4) {
                alert('Credits must be between 1 and 4.');
                return;
            }

            if (editingIndex !== null) {
                // Update existing course
                courses[editingIndex] = { name: name || 'Unnamed Course', credits, grade };
                resetToAddMode();
            } else {
                // Add new course
                courses.push({ name: name || 'Unnamed Course', credits, grade });
                inputCourseName.value = '';
                inputCredits.value = '3';
                inputGrade.value = 'A';
            }

            renderCoursesTable();
            inputCourseName.focus();
        });
    }

    // Clear all courses
    if (clearCoursesBtn) {
        clearCoursesBtn.addEventListener('click', function() {
            if (courses.length === 0) return;

            if (confirm('Are you sure you want to clear all courses?')) {
                courses = [];
                resetToAddMode();
                renderCoursesTable();
            }
        });
    }

    // Export to PDF
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            if (courses.length === 0) return;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Calculate totals
            let totalPoints = 0;
            let totalCredits = 0;
            let totalAllCredits = 0;

            courses.forEach(function(course) {
                const gradePoint = GRADE_POINTS[course.grade];
                totalAllCredits += course.credits;
                if (gradePoint !== null) {
                    totalPoints += gradePoint * course.credits;
                    totalCredits += course.credits;
                }
            });

            const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

            // Table data - no Course ID, just name, credits, grade
            const tableData = courses.map(function(course) {
                // Remove course ID prefix (8-digit number at start) if present
                const nameWithoutId = course.name.replace(/^\d{8}\s*/, '');
                return [
                    nameWithoutId,
                    course.credits,
                    course.grade
                ];
            });

            // Calculate table width based on columns
            const tableWidth = 160;
            const tableStartX = (210 - tableWidth) / 2; // Center on A4 page

            // Add table using autoTable
            doc.autoTable({
                head: [['Course Name', 'Credits', 'Grade']],
                body: tableData,
                startY: 20,
                theme: 'plain',
                margin: { left: tableStartX },
                styles: {
                    fontSize: 11,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0,
                    textColor: [0, 0, 0],
                },
                headStyles: {
                    fontStyle: 'bold',
                    halign: 'center',
                },
                columnStyles: {
                    0: { cellWidth: 110 },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 25, halign: 'center' }
                },
                didDrawCell: function(data) {
                    // Draw line under header row
                    if (data.section === 'head' && data.column.index === 2) {
                        doc.setLineWidth(0.3);
                        doc.line(tableStartX, data.cell.y + data.cell.height, tableStartX + tableWidth, data.cell.y + data.cell.height);
                    }
                    // Draw vertical column borders
                    if (data.column.index < 2) {
                        doc.setLineWidth(0.3);
                        const x = data.cell.x + data.cell.width;
                        doc.line(x, data.cell.y, x, data.cell.y + data.cell.height);
                    }
                },
            });

            // Draw border around the table
            const tableStartY = 20;
            const tableEndY = doc.lastAutoTable.finalY;
            doc.setLineWidth(0.3);
            doc.rect(tableStartX, tableStartY, tableWidth, tableEndY - tableStartY);

            // Add GPA summary below table - bold italic, centered
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.setFont('times', 'bolditalic');
            doc.text(`GPA : ${gpa.toFixed(2)}        Total Credits : ${totalAllCredits}`, tableStartX + (tableWidth / 2), finalY, { align: 'center' });

            // Save the PDF
            doc.save('gpa-report.pdf');
        });
    }

    // Handle edit and delete clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const index = parseInt(e.target.dataset.index);

            // If deleting the course being edited, reset form
            if (editingIndex === index) {
                resetToAddMode();
            } else if (editingIndex !== null && index < editingIndex) {
                // Adjust editing index if deleting a course before it
                editingIndex--;
            }

            courses.splice(index, 1);
            renderCoursesTable();
        }

        if (e.target.classList.contains('btn-edit')) {
            const index = parseInt(e.target.dataset.index);
            const course = courses[index];

            // Populate input fields with course data
            inputCourseName.value = course.name;
            inputCredits.value = course.credits;
            inputGrade.value = course.grade;

            // Change button to Update mode
            editingIndex = index;
            addCourseBtn.textContent = 'Update';
            addCourseBtn.classList.add('btn-update');

            // Scroll to input and focus
            inputCourseName.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputCourseName.focus();
        }

        // Handle remove course in simulator
        if (e.target.closest('.remove-course')) {
            e.target.closest('.course-entry').remove();
        }
    });

    // Render simulator courses table
    function renderSimulatorCoursesTable() {
        if (!simCoursesTbody) return;

        simCoursesTbody.innerHTML = simulatorCourses.map(function(course, index) {
            return `<tr data-index="${index}">
                <td>${course.name || 'Unnamed Course'}</td>
                <td class="text-center">${course.credits}</td>
                <td class="text-center">${course.grade}</td>
                <td class="text-center">
                    <button class="btn-edit btn-sim-edit" data-index="${index}">Edit</button>
                    <button class="btn-delete btn-sim-delete" data-index="${index}">Delete</button>
                </td>
            </tr>`;
        }).join('');

        // Show/hide table
        if (simulatorCourses.length > 0) {
            if (simCoursesTableContainer) simCoursesTableContainer.classList.remove('hidden');
        } else {
            if (simCoursesTableContainer) simCoursesTableContainer.classList.add('hidden');
        }
    }

    // Simulator editing state
    let simEditingIndex = null;

    // Add simulator course
    if (addSimulatorCourseBtn) {
        addSimulatorCourseBtn.addEventListener('click', function() {
            const name = simCourseName.value.trim();
            const credits = parseInt(simCredits.value);
            const grade = simGrade.value;

            if (credits < 1 || credits > 4) {
                alert('Credits must be between 1 and 4.');
                return;
            }

            if (simEditingIndex !== null) {
                // Update existing course
                simulatorCourses[simEditingIndex] = { name: name || 'Unnamed Course', credits, grade };
                simEditingIndex = null;
                addSimulatorCourseBtn.textContent = 'Add';
                addSimulatorCourseBtn.classList.remove('btn-update');
            } else {
                // Add new course
                simulatorCourses.push({ name: name || 'Unnamed Course', credits, grade });
            }

            // Reset inputs
            simCourseName.value = '';
            simCredits.value = '3';
            simGrade.value = 'A';

            renderSimulatorCoursesTable();
            simCourseName.focus();
        });
    }

    // Handle simulator course edit and delete
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-sim-delete')) {
            const index = parseInt(e.target.dataset.index);

            if (simEditingIndex === index) {
                simEditingIndex = null;
                addSimulatorCourseBtn.textContent = 'Add';
                addSimulatorCourseBtn.classList.remove('btn-update');
                simCourseName.value = '';
                simCredits.value = '3';
                simGrade.value = 'A';
            } else if (simEditingIndex !== null && index < simEditingIndex) {
                simEditingIndex--;
            }

            simulatorCourses.splice(index, 1);
            renderSimulatorCoursesTable();
        }

        if (e.target.classList.contains('btn-sim-edit')) {
            const index = parseInt(e.target.dataset.index);
            const course = simulatorCourses[index];

            simCourseName.value = course.name;
            simCredits.value = course.credits;
            simGrade.value = course.grade;

            simEditingIndex = index;
            addSimulatorCourseBtn.textContent = 'Update';
            addSimulatorCourseBtn.classList.add('btn-update');

            simCourseName.scrollIntoView({ behavior: 'smooth', block: 'center' });
            simCourseName.focus();
        }
    });

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
                    const isPossible = data.feasibility === 'Possible';
                    const requiredGpa = data.requiredGpa.toFixed(2);

                    let explanationText = '';
                    if (isPossible) {
                        if (requiredGpa >= 3.5) {
                            explanationText = `To reach your target, you need to average <strong>${requiredGpa}</strong> (mostly A grades) in your remaining <strong>${remainingCredits}</strong> credits.`;
                        } else if (requiredGpa >= 3.0) {
                            explanationText = `To reach your target, you need to average <strong>${requiredGpa}</strong> (B+ to A range) in your remaining <strong>${remainingCredits}</strong> credits.`;
                        } else if (requiredGpa >= 2.5) {
                            explanationText = `To reach your target, you need to average <strong>${requiredGpa}</strong> (B to B+ range) in your remaining <strong>${remainingCredits}</strong> credits.`;
                        } else {
                            explanationText = `To reach your target, you need to average <strong>${requiredGpa}</strong> in your remaining <strong>${remainingCredits}</strong> credits. This is achievable with moderate effort.`;
                        }
                    } else {
                        explanationText = `Your target GPA of <strong>${targetGpa.toFixed(2)}</strong> requires an average above 4.0 in your remaining credits, which is not possible.`;
                    }

                    plannerResult.innerHTML = `
                        <h3>GPA Goal Analysis</h3>
                        <div class="result-row">
                            <span>Target GPA</span>
                            <strong>${targetGpa.toFixed(2)}</strong>
                        </div>
                        <div class="result-row">
                            <span>Required Average</span>
                            <strong class="${isPossible ? '' : 'text-danger'}">${requiredGpa}</strong>
                        </div>
                        <div class="result-row">
                            <span>Status</span>
                            <strong class="${isPossible ? 'text-success' : 'text-danger'}">${isPossible ? 'Achievable' : 'Not Possible'}</strong>
                        </div>
                        <p class="result-explanation">${explanationText}</p>
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

            // Use simulatorCourses array instead of DOM queries
            const futureCourses = simulatorCourses.map(function(course) {
                return { grade: course.grade, credits: course.credits };
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

                        let explanationText = '';
                        if (gpaChange > 0.1) {
                            explanationText = `These courses will <strong>raise</strong> your cumulative GPA by <strong>${gpaChange.toFixed(2)}</strong> points.`;
                        } else if (gpaChange < -0.1) {
                            explanationText = `These courses will <strong>lower</strong> your cumulative GPA by <strong>${Math.abs(gpaChange).toFixed(2)}</strong> points.`;
                        } else {
                            explanationText = `These courses will have <strong>minimal impact</strong> on your cumulative GPA.`;
                        }

                        simulatorResult.innerHTML = `
                            <h3>Simulation Results</h3>
                            <div class="result-row">
                                <span>This Term's GPA</span>
                                <strong>${data.termGpa.toFixed(2)}</strong>
                            </div>
                            <div class="result-row">
                                <span>New Cumulative GPA</span>
                                <strong class="${changeClass}">${data.cumulativeGpa.toFixed(2)}</strong>
                            </div>
                            <div class="result-row">
                                <span>Current GPA</span>
                                <strong>${currentGpa.toFixed(2)}</strong>
                            </div>
                            <p class="result-explanation">${explanationText}</p>
                        `;
                    } else {
                        // Show cumulative GPA results
                        const gpaChange = data.gpaChange;
                        const changeClass = gpaChange > 0 ? 'positive' : gpaChange < 0 ? 'negative' : 'neutral';

                        let explanationText = '';
                        if (gpaChange > 0.1) {
                            explanationText = `After completing these courses, your GPA will <strong>increase</strong> from <strong>${currentGpa.toFixed(2)}</strong> to <strong>${data.newGpa.toFixed(2)}</strong>.`;
                        } else if (gpaChange < -0.1) {
                            explanationText = `After completing these courses, your GPA will <strong>decrease</strong> from <strong>${currentGpa.toFixed(2)}</strong> to <strong>${data.newGpa.toFixed(2)}</strong>.`;
                        } else {
                            explanationText = `These courses will <strong>maintain</strong> your current GPA at around <strong>${data.newGpa.toFixed(2)}</strong>.`;
                        }

                        simulatorResult.innerHTML = `
                            <h3>Simulation Results</h3>
                            <div class="result-row">
                                <span>Current GPA</span>
                                <strong>${currentGpa.toFixed(2)}</strong>
                            </div>
                            <div class="result-row">
                                <span>Projected GPA</span>
                                <strong class="${changeClass}">${data.newGpa.toFixed(2)}</strong>
                            </div>
                            <div class="result-row">
                                <span>Change</span>
                                <strong class="${changeClass}">${gpaChange >= 0 ? '+' : ''}${gpaChange.toFixed(2)}</strong>
                            </div>
                            <p class="result-explanation">${explanationText}</p>
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