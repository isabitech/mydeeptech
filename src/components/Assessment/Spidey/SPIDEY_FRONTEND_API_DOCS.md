# 🎯 Spidey Assessment Frontend API Documentation

## 📋 Overview

This document provides comprehensive frontend integration guidance for the **Spidey High-Discipline Assessment** - a 4-stage quality enforcement engine within the Prompt Instantiation Project.

**⚠️ CRITICAL DESIGN PRINCIPLES**
- **Server Authority**: Frontend never determines pass/fail - server has final say
- **State Machine**: Strict progression through stages (no skipping)
- **Zero Tolerance**: Any violation = immediate failure
- **One Attempt**: No retakes allowed by default
- **Real-time Validation**: Server validates every input

---

## 🗺️ Assessment Flow Overview

```
Discovery → Start → Stage 1 → Stage 2 → Stage 3 → Stage 4 → Complete
    ↓         ↓        ↓        ↓        ↓        ↓         ↓
Available   Session  Quiz   Validation Files   Integrity  Results
```

### Stage Progression Rules
1. **Linear Flow**: Must complete stages in order
2. **No Back Button**: Cannot return to previous stages
3. **Time Limits**: Each stage has strict time limits
4. **Auto-Save**: Progress saved automatically
5. **Failure Exit**: Any failure terminates entire assessment

---

## 🔍 Phase 1: Assessment Discovery

### GET `/api/assessments/available`

**Purpose**: Display all available assessments including Spidey

```typescript
interface AvailableAssessmentsResponse {
  success: boolean;
  data: {
    assessments: Assessment[];
    summary: {
      totalAssessments: number;
      spideyAssessments: number;
      userCanTake: number;
    };
    instructions: {
      spidey: string; // "⚠️ Spidey is a high-discipline assessment..."
    };
  };
}

interface Assessment {
  id: string;                    // Assessment config ID
  type: 'spidey_assessment';
  title: string;                 // "Spidey High-Discipline Assessment"
  description: string;
  category: 'quality_enforcement';
  difficulty: 'expert';
  estimatedDuration: number;     // 165 minutes total
  totalStages: number;           // 4
  stageLimits: {
    stage1: number;              // 30 minutes
    stage2: number;              // 45 minutes  
    stage3: number;              // 60 minutes
    stage4: number;              // 30 minutes
  };
  passingScore: number;          // 85
  maxAttempts: number;           // 1
  cooldownDays: number;          // 30
  requirements: string[];        // Warning messages
  warnings: string[];           // Critical failure conditions
  userStatus: {
    hasAttempted: boolean;
    status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'passed' | 'failed';
    canRetake: boolean;         // Usually false
    nextRetakeAvailable: string | null;
  };
}
```

### 🎨 UI Component: Assessment Discovery Card

```jsx
function SpideyAssessmentCard({ assessment }) {
  const isHighRisk = assessment.type === 'spidey_assessment';
  
  return (
    <div className={`assessment-card ${isHighRisk ? 'high-risk' : ''}`}>
      {isHighRisk && (
        <div className="warning-banner">
          ⚠️ HIGH-DISCIPLINE ASSESSMENT - ONE ATTEMPT ONLY
        </div>
      )}
      
      <h3>{assessment.title}</h3>
      <div className="difficulty-badge expert">Expert Level</div>
      
      <div className="assessment-stats">
        <div className="stat">
          <span className="label">Duration:</span>
          <span className="value">{assessment.estimatedDuration}min</span>
        </div>
        <div className="stat">
          <span className="label">Passing Score:</span>
          <span className="value">{assessment.passingScore}%</span>
        </div>
        <div className="stat">
          <span className="label">Attempts:</span>
          <span className="value critical">{assessment.maxAttempts} only</span>
        </div>
      </div>

      <div className="stage-breakdown">
        <h4>4 Stages Required:</h4>
        {assessment.stages?.map((stage, index) => (
          <div key={index} className="stage-item">
            <span className="stage-number">{index + 1}</span>
            <span className="stage-name">{stage.name}</span>
            <span className="stage-time">{stage.timeLimit}min</span>
          </div>
        ))}
      </div>

      <div className="warnings-section">
        <h4>⚠️ Hard Failure Conditions:</h4>
        <ul className="warning-list">
          {assessment.warnings?.map((warning, index) => (
            <li key={index} className="warning-item">{warning}</li>
          ))}
        </ul>
      </div>

      <div className="action-section">
        {assessment.userStatus.canRetake ? (
          <button 
            className="btn btn-danger btn-lg"
            onClick={() => handleStartAssessment(assessment.id)}
          >
            🚨 Start High-Risk Assessment
          </button>
        ) : (
          <div className="disabled-reason">
            {assessment.userStatus.nextRetakeAvailable || 'Assessment completed'}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 🔴 Critical UI Requirements

1. **Warning Prominence**: Use red/orange colors for Spidey assessment
2. **Clear Risk Communication**: Multiple warnings about one-attempt policy
3. **Stage Visibility**: Show all 4 stages and time limits upfront
4. **Failure Conditions**: List all hard failure rules prominently
5. **Confirmation Modal**: Double confirmation before starting

---

## 🚀 Phase 2: Assessment Initialization

### POST `/api/assessments/spidey/start`

**Purpose**: Initialize new Spidey assessment session

```typescript
// Request
interface StartSpideyRequest {
  // No body required - uses authenticated user
}

// Response
interface StartSpideyResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: string;           // Use this for all subsequent requests
    assessmentTitle: string;
    currentStage: 'stage1';
    stage1Config: Stage1Config;
    instructions: string;
    sessionId: string;              // For security tracking
  };
}

interface Stage1Config {
  name: 'Guideline Comprehension';
  timeLimit: number;               // 30 minutes in minutes
  passingScore: number;            // 80
  questions: QuizQuestion[];       // Array of 5 questions
}

interface QuizQuestion {
  questionId: string;              // 'comp_001'
  questionText: string;
  questionType: 'multiple_choice';
  options: {
    optionId: string;              // 'A', 'B', 'C', 'D'
    optionText: string;
    // isCorrect is NOT sent to frontend
  }[];
  isCritical: boolean;             // If true, wrong answer = immediate fail
  points: number;
}
```

### 🎨 UI Component: Assessment Initialization

```jsx
function StartAssessmentModal({ assessmentId, onStart, onCancel }) {
  const [confirmed, setConfirmed] = useState(false);
  const [acknowledged, setAcknowledged] = useState({
    oneAttempt: false,
    timeLimit: false,
    hardRules: false,
    serverAuthority: false
  });

  const allAcknowledged = Object.values(acknowledged).every(Boolean);

  return (
    <Modal className="start-assessment-modal high-risk">
      <div className="modal-header danger">
        <h2>🚨 Spidey High-Discipline Assessment</h2>
        <div className="risk-badge">EXPERT LEVEL - HIGH RISK</div>
      </div>

      <div className="modal-body">
        <div className="critical-warnings">
          <h3>⚠️ CRITICAL REQUIREMENTS</h3>
          
          <label className="acknowledgment-item">
            <input 
              type="checkbox" 
              checked={acknowledged.oneAttempt}
              onChange={(e) => setAcknowledged(prev => ({
                ...prev, 
                oneAttempt: e.target.checked
              }))}
            />
            <span>I understand this is <strong>ONE ATTEMPT ONLY</strong> - no retakes allowed</span>
          </label>

          <label className="acknowledgment-item">
            <input 
              type="checkbox"
              checked={acknowledged.timeLimit}
              onChange={(e) => setAcknowledged(prev => ({
                ...prev, 
                timeLimit: e.target.checked
              }))}
            />
            <span>I understand there are <strong>STRICT TIME LIMITS</strong> for each stage</span>
          </label>

          <label className="acknowledgment-item">
            <input 
              type="checkbox"
              checked={acknowledged.hardRules}
              onChange={(e) => setAcknowledged(prev => ({
                ...prev, 
                hardRules: e.target.checked
              }))}
            />
            <span>I understand <strong>ANY RULE VIOLATION</strong> results in immediate failure</span>
          </label>

          <label className="acknowledgment-item">
            <input 
              type="checkbox"
              checked={acknowledged.serverAuthority}
              onChange={(e) => setAcknowledged(prev => ({
                ...prev, 
                serverAuthority: e.target.checked
              }))}
            />
            <span>I understand the <strong>SERVER HAS FINAL AUTHORITY</strong> on all decisions</span>
          </label>
        </div>

        <div className="stage-timeline">
          <h4>Assessment Timeline (165 minutes total):</h4>
          <div className="timeline">
            <div className="timeline-item">Stage 1: Comprehension (30min)</div>
            <div className="timeline-item">Stage 2: Task Validation (45min)</div>
            <div className="timeline-item">Stage 3: Solution & Rubric (60min)</div>
            <div className="timeline-item">Stage 4: Integrity Test (30min)</div>
          </div>
        </div>

        {allAcknowledged && (
          <div className="final-confirmation">
            <label className="final-check">
              <input 
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>I am ready to begin the high-discipline assessment</span>
            </label>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel - I need more time to prepare
        </button>
        <button 
          className="btn btn-danger"
          disabled={!allAcknowledged || !confirmed}
          onClick={() => onStart(assessmentId)}
        >
          🚨 BEGIN ASSESSMENT - NO TURNING BACK
        </button>
      </div>
    </Modal>
  );
}
```

---

## 📝 Phase 3: Stage 1 - Guideline Comprehension

### Timer Implementation

```jsx
function AssessmentTimer({ timeLimit, onTimeUp, submissionId, stage }) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 300; // Last 5 minutes

  return (
    <div className={`assessment-timer ${isLowTime ? 'low-time' : ''}`}>
      <div className="timer-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="timer-label">Time Remaining</div>
      {isLowTime && (
        <div className="low-time-warning">
          ⚠️ Less than 5 minutes remaining!
        </div>
      )}
    </div>
  );
}
```

### POST `/api/assessments/spidey/{submissionId}/stage1/submit`

**Purpose**: Submit Stage 1 quiz responses

```typescript
// Request
interface Stage1SubmitRequest {
  responses: {
    questionId: string;
    userAnswer: string | boolean | string[];  // Depends on question type
  }[];
  timeSpent: number;  // In seconds
}

// Success Response (Stage 1 Passed)
interface Stage1SuccessResponse {
  success: true;
  message: "Stage 1 completed successfully";
  data: {
    stage1Results: {
      score: number;          // Correct answers
      maxScore: number;       // Total questions
      percentage: number;     // Calculated percentage
      passed: true;
    };
    currentStage: 'stage2';   // Progressed to next stage
    nextStage: Stage2Config;  // Configuration for stage 2
  };
}

// Failure Response (Failed Stage 1)
interface Stage1FailureResponse {
  success: false;
  message: "Critical question answered incorrectly. Assessment failed." | 
           "Stage 1 failed - score below passing threshold";
  failureReason?: string;     // If critical failure
  data?: {
    score: number;
    maxScore: number;
    percentage: number;
    requiredPercentage: number;
  };
  finalStatus: 'failed';
}
```

### 🎨 UI Component: Stage 1 Quiz Interface

```jsx
function Stage1Quiz({ submissionId, stage1Config, onStageComplete, onAssessmentFailed }) {
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const timeSpent = Math.floor((new Date() - startTime) / 1000);
    const responseArray = Object.entries(responses).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer
    }));

    try {
      const response = await fetch(`/api/assessments/spidey/${submissionId}/stage1/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responseArray,
          timeSpent
        })
      });

      const result = await response.json();

      if (result.success) {
        onStageComplete(2, result.data);
      } else {
        onAssessmentFailed(result.message, result);
      }
    } catch (error) {
      onAssessmentFailed('Network error occurred', { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allQuestionsAnswered = stage1Config.questions.every(
    q => responses[q.questionId] !== undefined
  );

  return (
    <div className="stage1-quiz">
      <div className="stage-header">
        <h2>Stage 1: Guideline Comprehension</h2>
        <div className="stage-info">
          <span>5 Questions | 80% Required to Pass</span>
          <AssessmentTimer 
            timeLimit={stage1Config.timeLimit}
            onTimeUp={() => handleSubmit()}
            submissionId={submissionId}
            stage="stage1"
          />
        </div>
      </div>

      <div className="questions-container">
        {stage1Config.questions.map((question, index) => (
          <div key={question.questionId} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              {question.isCritical && (
                <span className="critical-badge">⚠️ CRITICAL</span>
              )}
            </div>
            
            <h3 className="question-text">{question.questionText}</h3>
            
            <div className="options-list">
              {question.options.map(option => (
                <label key={option.optionId} className="option-item">
                  <input
                    type="radio"
                    name={question.questionId}
                    value={option.optionId}
                    checked={responses[question.questionId] === option.optionId}
                    onChange={(e) => setResponses(prev => ({
                      ...prev,
                      [question.questionId]: e.target.value
                    }))}
                  />
                  <span className="option-text">{option.optionText}</span>
                </label>
              ))}
            </div>

            {question.isCritical && (
              <div className="critical-warning">
                ⚠️ This is a critical question. Wrong answer = immediate assessment failure.
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="stage-footer">
        <div className="progress-info">
          Questions Answered: {Object.keys(responses).length} / {stage1Config.questions.length}
        </div>
        
        <button
          className="btn btn-primary btn-lg"
          disabled={!allQuestionsAnswered || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Stage 1'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🔍 Phase 4: Stage 2 - Mini Task Validation

### POST `/api/assessments/spidey/{submissionId}/stage2/submit`

**Purpose**: Submit Stage 2 task validation responses

```typescript
// Request
interface Stage2SubmitRequest {
  promptText: string;           // 50-2000 chars
  domain: string;              // 3-100 chars
  failureExplanation: string;   // 100-1000 chars
  fileReferences: string[];     // Must have at least 1
  response: string;            // 100-3000 chars
  timeSpent: number;           // In seconds
}

// Success Response
interface Stage2SuccessResponse {
  success: true;
  message: "Stage 2 completed successfully";
  data: {
    stage2Results: {
      validation: {
        hasFileReference: boolean;
        validDomain: boolean;
        noForbiddenKeywords: boolean;
        adequateLength: boolean;
        logicalExplanation: boolean;
      };
      passed: true;
    };
    currentStage: 'stage3';
    nextStage: Stage3Config;
  };
}

// Failure Response
interface Stage2FailureResponse {
  success: false;
  message: "Stage 2 failed - validation errors";
  violations: string[];        // List of specific violations
  finalStatus: 'failed';
}
```

### 🎨 UI Component: Stage 2 Task Validation

```jsx
function Stage2TaskValidation({ submissionId, stage2Config, onStageComplete, onAssessmentFailed }) {
  const [formData, setFormData] = useState({
    promptText: '',
    domain: '',
    failureExplanation: '',
    fileReferences: [],
    response: ''
  });
  
  const [validationState, setValidationState] = useState({
    promptText: null,
    domain: null,
    failureExplanation: null,
    fileReferences: null,
    response: null
  });

  const [startTime] = useState(new Date());

  // Real-time validation
  useEffect(() => {
    validateField('promptText', formData.promptText);
  }, [formData.promptText]);

  const validateField = (fieldName, value) => {
    let isValid = null;
    let warnings = [];

    switch (fieldName) {
      case 'promptText':
        // Check forbidden keywords
        const forbiddenKeywords = ['summarize', 'summary', 'tldr', 'brief'];
        const hasForbiddenKeywords = forbiddenKeywords.some(keyword =>
          value.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasForbiddenKeywords) {
          isValid = false;
          warnings.push('🚫 Contains forbidden keywords - will cause immediate failure');
        } else if (value.length >= 50) {
          isValid = true;
        }
        break;

      case 'fileReferences':
        isValid = value.length > 0;
        if (!isValid) {
          warnings.push('⚠️ File references required - missing will cause failure');
        }
        break;

      // ... other validation logic
    }

    setValidationState(prev => ({
      ...prev,
      [fieldName]: { isValid, warnings }
    }));
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((new Date() - startTime) / 1000);
    
    try {
      const response = await fetch(`/api/assessments/spidey/${submissionId}/stage2/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, timeSpent })
      });

      const result = await response.json();

      if (result.success) {
        onStageComplete(3, result.data);
      } else {
        onAssessmentFailed(result.message, result);
      }
    } catch (error) {
      onAssessmentFailed('Network error occurred', { error: error.message });
    }
  };

  return (
    <div className="stage2-validation">
      <div className="stage-header">
        <h2>Stage 2: Mini Task Validation</h2>
        <AssessmentTimer 
          timeLimit={45}
          onTimeUp={() => handleSubmit()}
          submissionId={submissionId}
          stage="stage2"
        />
      </div>

      <form className="validation-form">
        {/* Prompt Text Field */}
        <div className={`form-group ${validationState.promptText?.isValid === false ? 'has-error' : ''}`}>
          <label htmlFor="promptText">Prompt Text *</label>
          <textarea
            id="promptText"
            value={formData.promptText}
            onChange={(e) => setFormData(prev => ({ ...prev, promptText: e.target.value }))}
            placeholder="Enter your prompt text here..."
            minLength={50}
            maxLength={2000}
            rows={4}
            className="form-control"
          />
          <div className="field-info">
            <span className="char-count">{formData.promptText.length} / 2000</span>
            {validationState.promptText?.warnings?.map((warning, index) => (
              <div key={index} className="validation-warning">{warning}</div>
            ))}
          </div>
        </div>

        {/* Domain Field */}
        <div className="form-group">
          <label htmlFor="domain">Domain *</label>
          <input
            id="domain"
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
            placeholder="e.g., Healthcare, Finance, Education"
            minLength={3}
            maxLength={100}
            className="form-control"
          />
        </div>

        {/* File References */}
        <div className="form-group">
          <label>File References *</label>
          <div className="file-references-input">
            <input
              type="text"
              placeholder="Add file reference (e.g., document.pdf, data.csv)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value) {
                    setFormData(prev => ({
                      ...prev,
                      fileReferences: [...prev.fileReferences, value]
                    }));
                    e.target.value = '';
                  }
                }
              }}
            />
            <div className="file-references-list">
              {formData.fileReferences.map((ref, index) => (
                <span key={index} className="file-reference-tag">
                  {ref}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fileReferences: prev.fileReferences.filter((_, i) => i !== index)
                    }))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Failure Explanation */}
        <div className="form-group">
          <label htmlFor="failureExplanation">Failure Explanation *</label>
          <textarea
            id="failureExplanation"
            value={formData.failureExplanation}
            onChange={(e) => setFormData(prev => ({ ...prev, failureExplanation: e.target.value }))}
            placeholder="Explain why this task might fail and how to identify failure conditions..."
            minLength={100}
            maxLength={1000}
            rows={3}
            className="form-control"
          />
        </div>

        {/* Response */}
        <div className="form-group">
          <label htmlFor="response">Task Response *</label>
          <textarea
            id="response"
            value={formData.response}
            onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
            placeholder="Provide your complete response to the task..."
            minLength={100}
            maxLength={3000}
            rows={6}
            className="form-control"
          />
        </div>

        <div className="stage-footer">
          <div className="validation-summary">
            <h4>Validation Checklist:</h4>
            <div className={`validation-item ${formData.promptText.length >= 50 ? 'valid' : 'invalid'}`}>
              ✓ Prompt text adequate length
            </div>
            <div className={`validation-item ${formData.fileReferences.length > 0 ? 'valid' : 'invalid'}`}>
              ✓ File references provided
            </div>
            <div className={`validation-item ${!['summarize', 'summary'].some(k => formData.promptText.toLowerCase().includes(k)) ? 'valid' : 'invalid'}`}>
              ✓ No forbidden keywords detected
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Submit Stage 2
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 📄 Phase 5: Stage 3 - Golden Solution & Rubric

### File Upload Implementation

```jsx
function FileUploadSection({ onFilesChange, allowedTypes, maxSize }) {
  const [files, setFiles] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      // Validate file type
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        errors.push(`${file.name}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        return;
      }

      validFiles.push(file);
    });

    setFiles(prev => [...prev, ...validFiles]);
    setUploadErrors(errors);
    onFilesChange([...files, ...validFiles]);
  };

  return (
    <div className="file-upload-section">
      <div className="upload-area">
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="file-input"
        />
        <div className="upload-instructions">
          <p>Drag files here or click to select</p>
          <p>Allowed types: {allowedTypes.join(', ')}</p>
          <p>Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB per file</p>
        </div>
      </div>

      {uploadErrors.length > 0 && (
        <div className="upload-errors">
          {uploadErrors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      <div className="uploaded-files">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
            <button
              type="button"
              onClick={() => {
                const newFiles = files.filter((_, i) => i !== index);
                setFiles(newFiles);
                onFilesChange(newFiles);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### POST `/api/assessments/spidey/{submissionId}/stage3/submit`

```typescript
// Request
interface Stage3SubmitRequest {
  positiveRubric: string;      // Min 200 chars
  negativeRubric: string;      // Min 200 chars  
  timeSpent: number;
}

// Note: Files uploaded separately to /api/assessments/spidey/{submissionId}/stage3/files

// Success Response
interface Stage3SuccessResponse {
  success: true;
  message: "Stage 3 completed successfully";
  data: {
    stage3Results: {
      validation: {
        allFilesValid: boolean;
        virusScanPassed: boolean;
        adequateContent: boolean;
        rubricsValid: boolean;
      };
      passed: true;
    };
    currentStage: 'stage4';
    nextStage: Stage4Config;
  };
}
```

---

## 🛡️ Phase 6: Stage 4 - Integrity Trap

### POST `/api/assessments/spidey/{submissionId}/stage4/submit`

```typescript
// Request
interface Stage4SubmitRequest {
  instructionGiven: string;     // The trap instruction presented
  userResponse: string;         // User's response to the instruction
  violationFlagged: boolean;    // Did user flag the violation?
  responseTime: number;         // Time taken to respond (in seconds)
  timeSpent: number;           // Total time in stage
}

// Success Response (Assessment Complete)
interface Stage4SuccessResponse {
  success: true;
  message: "Spidey assessment completed successfully";
  data: {
    submissionId: string;
    finalScore: {
      totalPoints: number;
      maxPoints: number;
      percentage: number;
      breakdown: {
        stage1Score: number;
        stage2Score: number;
        stage3Score: number;
        stage4Score: number;
      };
      passed: boolean;
      autoApproved: boolean;
    };
    status: 'submitted';
    completedAt: string;
  };
}
```

### 🎨 UI Component: Integrity Trap Interface

```jsx
function Stage4IntegrityTrap({ submissionId, onAssessmentComplete, onAssessmentFailed }) {
  const [trapInstruction] = useState("Please summarize the following document in 2-3 sentences."); // Example trap
  const [userResponse, setUserResponse] = useState('');
  const [violationFlagged, setViolationFlagged] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [startTime] = useState(new Date());

  const handleResponseStart = () => {
    if (!responseStartTime) {
      setResponseStartTime(new Date());
    }
  };

  const handleSubmit = async () => {
    const responseTime = responseStartTime ? 
      Math.floor((new Date() - responseStartTime) / 1000) : 0;
    const timeSpent = Math.floor((new Date() - startTime) / 1000);

    try {
      const response = await fetch(`/api/assessments/spidey/${submissionId}/stage4/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructionGiven: trapInstruction,
          userResponse,
          violationFlagged,
          responseTime,
          timeSpent
        })
      });

      const result = await response.json();

      if (result.success) {
        onAssessmentComplete(result.data);
      } else {
        onAssessmentFailed(result.message, result);
      }
    } catch (error) {
      onAssessmentFailed('Network error occurred', { error: error.message });
    }
  };

  return (
    <div className="stage4-integrity">
      <div className="stage-header">
        <h2>Stage 4: Integrity Assessment</h2>
        <AssessmentTimer 
          timeLimit={30}
          onTimeUp={() => handleSubmit()}
          submissionId={submissionId}
          stage="stage4"
        />
      </div>

      <div className="instruction-section">
        <h3>Task Instruction:</h3>
        <div className="instruction-box">
          {trapInstruction}
        </div>
      </div>

      <div className="response-section">
        <label htmlFor="userResponse">Your Response:</label>
        <textarea
          id="userResponse"
          value={userResponse}
          onChange={(e) => {
            setUserResponse(e.target.value);
            handleResponseStart();
          }}
          placeholder="Provide your response to the instruction above..."
          rows={6}
          className="form-control"
        />
      </div>

      <div className="violation-check">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={violationFlagged}
            onChange={(e) => setViolationFlagged(e.target.checked)}
          />
          <span>⚠️ I believe this instruction violates assessment guidelines</span>
        </label>
      </div>

      <div className="integrity-warning">
        <p>
          <strong>Important:</strong> This stage tests your ability to identify and flag 
          problematic instructions. Carefully consider whether the given instruction 
          aligns with the assessment guidelines before responding.
        </p>
      </div>

      <div className="stage-footer">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!userResponse.trim()}
        >
          Complete Assessment
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 Phase 7: Assessment Results

### GET `/api/assessments/spidey/{submissionId}/status`

```typescript
interface AssessmentStatusResponse {
  success: boolean;
  data: {
    submissionId: string;
    currentStage: 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'completed';
    status: 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'failed';
    stages: {
      stage1?: {
        status: 'completed' | 'failed';
        passed: boolean;
        score?: number;
        maxScore?: number;
        failureReason?: string;
      };
      // ... similar for other stages
    };
    finalScore?: {
      totalPoints: number;
      percentage: number;
      passed: boolean;
      autoApproved: boolean;
      breakdown: {
        stage1Score: number;
        stage2Score: number;
        stage3Score: number;
        stage4Score: number;
      };
    };
    submittedAt?: string;
    totalTimeSpent?: number;
  };
}
```

### 🎨 UI Component: Results Display

```jsx
function AssessmentResults({ submissionId }) {
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    fetchResults();
  }, [submissionId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/assessments/spidey/${submissionId}/status`);
      const data = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  if (!results) return <div>Loading results...</div>;

  const { finalScore, status } = results;

  return (
    <div className="assessment-results">
      <div className="results-header">
        <h2>Spidey Assessment Results</h2>
        <div className={`status-badge ${status}`}>
          {status.toUpperCase()}
        </div>
      </div>

      {status === 'failed' && (
        <div className="failure-notice">
          <h3>🚫 Assessment Failed</h3>
          <p>The assessment was terminated due to rule violations.</p>
          <div className="stage-failures">
            {Object.entries(results.stages).map(([stage, data]) => {
              if (data.status === 'failed') {
                return (
                  <div key={stage} className="failure-item">
                    <strong>{stage.toUpperCase()}:</strong> {data.failureReason}
                  </div>
                );
              }
            })}
          </div>
          <div className="no-retake-notice">
            <p><strong>No retakes are allowed for the Spidey Assessment.</strong></p>
          </div>
        </div>
      )}

      {status === 'submitted' && finalScore && (
        <div className="success-results">
          <div className="overall-score">
            <div className="score-circle">
              <span className="percentage">{finalScore.percentage}%</span>
              <span className="label">Overall Score</span>
            </div>
            <div className={`pass-status ${finalScore.passed ? 'passed' : 'failed'}`}>
              {finalScore.passed ? '✅ PASSED' : '❌ FAILED'}
            </div>
          </div>

          <div className="score-breakdown">
            <h3>Stage Breakdown:</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span className="stage">Stage 1</span>
                <span className="score">{finalScore.breakdown.stage1Score.toFixed(1)}/20</span>
              </div>
              <div className="breakdown-item">
                <span className="stage">Stage 2</span>
                <span className="score">{finalScore.breakdown.stage2Score.toFixed(1)}/30</span>
              </div>
              <div className="breakdown-item">
                <span className="stage">Stage 3</span>
                <span className="score">{finalScore.breakdown.stage3Score.toFixed(1)}/30</span>
              </div>
              <div className="breakdown-item">
                <span className="stage">Stage 4</span>
                <span className="score">{finalScore.breakdown.stage4Score.toFixed(1)}/20</span>
              </div>
            </div>
          </div>

          {finalScore.passed && (
            <div className="next-steps">
              <h3>What's Next?</h3>
              <p>
                {finalScore.autoApproved ? 
                  '🎉 Congratulations! Your submission has been automatically approved.' :
                  '📋 Your submission is now under QA review. You will be notified of the final decision.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      <div className="results-footer">
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.href = '/assessments'}
        >
          Back to Assessments
        </button>
      </div>
    </div>
  );
}
```

---

## 🚨 Critical Frontend Requirements

### 1. **Error Handling**

```jsx
function AssessmentErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="assessment-error">
          <h2>🚫 Assessment Error</h2>
          <p>The assessment encountered an error and must be terminated.</p>
          <p><strong>No retakes are available.</strong></p>
          <button onClick={() => window.location.href = '/assessments'}>
            Return to Assessments
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 2. **Auto-Save Implementation**

```jsx
function useAssessmentAutoSave(submissionId, stage, data) {
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch(`/api/assessments/spidey/${submissionId}/auto-save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage, data })
        });
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [submissionId, stage, data]);
}
```

### 3. **Session Security**

```jsx
function useSessionSecurity(submissionId) {
  useEffect(() => {
    // Prevent back button
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, null, window.location.pathname);
    });

    // Prevent page refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Leaving will terminate your assessment. Are you sure?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Detect tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn('Tab hidden - potential cheating detected');
        // Log suspicious activity
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submissionId]);
}
```

---

## 🎨 CSS Guidelines

```css
/* High-Risk Assessment Styling */
.assessment-card.high-risk {
  border: 2px solid #dc3545;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.warning-banner {
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-weight: bold;
  margin: -1px -1px 16px -1px;
}

.critical-badge {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.assessment-timer.low-time {
  color: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.validation-warning {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid #dee2e6;
  background: #f8f9fa;
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
  font-weight: bold;
}

.btn-danger:hover {
  background: #c82333;
  border-color: #bd2130;
}
```

---

## 📚 Summary

This documentation provides complete frontend integration for the Spidey High-Discipline Assessment. Key implementation requirements:

1. **Server Authority**: Never calculate scores frontend-side
2. **Real-time Validation**: Warn users about violations immediately  
3. **Security**: Prevent cheating, track suspicious activity
4. **User Experience**: Clear warnings, progress tracking, helpful feedback
5. **Error Handling**: Graceful failures with no-retake notices
6. **Responsive Design**: Works on all devices and browsers

The frontend should emphasize the high-risk nature of this assessment while providing a smooth, secure experience for qualified candidates.