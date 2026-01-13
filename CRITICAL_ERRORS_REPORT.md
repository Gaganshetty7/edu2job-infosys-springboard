# Critical Errors Report

## Backend (job-role-pred-bend)

### 1. **CRITICAL - TypeError in predict_view() - Wrong data structure handling**
   - **Location**: `ml/views.py` lines 54-56
   - **Issue**: `predict_job_role()` returns a **list of dictionaries** `[{role: str, confidence: float, reasons: []}, ...]`, but the code tries to access it as `job[0]` and `job[1]['confidence']`
   - **Impact**: Will cause **TypeError/AttributeError** when making predictions - **FAILS LOUDLY**
   - **Current Code**:
     ```python
     job = predict_job_role(skills, qualification, experience)
     predicted_role = str(job[0])[:250]  # WRONG - job[0] is a dict, not a string
     confidence = float(job[1]['confidence'])  # WRONG - accessing index 1 when job is a list
     ```
   - **Expected**: Should handle list of dicts: `job[0]['role']`, `job[0]['confidence']`

### 2. **CRITICAL - Missing `approved_at` field in Prediction model**
   - **Location**: `ml/views.py` line 177, `ml/models.py`
   - **Issue**: Code tries to set `prediction.approved_at = timezone.now()` but the `Prediction` model doesn't have this field
   - **Impact**: Will cause **AttributeError** when user approves a prediction - **FAILS LOUDLY**
   - **Model Definition**: `ml/models.py` only has: `predicted_roles`, `confidence_scores`, `timestamp`, `user_id`, `is_approved`, `is_flagged`
   - **Missing Field**: `approved_at = models.DateTimeField(null=True, blank=True)`

### 3. **WARNING - Duplicate imports in backend/urls.py**
   - **Location**: `backend/urls.py` lines 17-21
   - **Issue**: Duplicate imports (lines 17-18 duplicate 20-21)
   - **Impact**: Not critical, but should be cleaned up for code quality

### 4. **WARNING - Unused import in ml/urls.py**
   - **Location**: `ml/urls.py` line 2
   - **Issue**: `train_model` is imported but never used in urlpatterns (only `train_view` is used)
   - **Impact**: Not critical, but should be removed

## Frontend (job-role-pred-webfend)

### 5. **CRITICAL - Missing environment variable VITE_API_BASE**
   - **Location**: Multiple files use `import.meta.env.VITE_API_BASE`
     - `DashboardPage.tsx` line 43
     - `AdminPanelPage.tsx` lines 35, 67
     - `PredictionPage.tsx` lines 44, 74, 130
   - **Issue**: `VITE_API_BASE` environment variable is not defined
   - **Impact**: API calls will fail with malformed URLs like `undefined/api/...` - **FAILS LOUDLY**
   - **Solution**: Need to create `.env` file with `VITE_API_BASE=http://127.0.0.1:8000`
   - **Note**: `axiosInstance.ts` uses hardcoded baseURL, but fetch() calls don't use axios

### 6. **WARNING - Inconsistent API base URL usage**
   - **Location**: Frontend uses both `axiosInstance.ts` (hardcoded) and direct `fetch()` with env variable
   - **Issue**: Mixed usage of hardcoded URLs vs environment variables
   - **Impact**: Could cause confusion and deployment issues

## Summary

**MUST FIX (Will cause runtime errors):**
1. Fix predict_view() data structure handling (Error #1)
2. Add approved_at field to Prediction model (Error #2)
3. Add VITE_API_BASE environment variable (Error #5)

**SHOULD FIX (Code quality/security):**
4. Remove duplicate imports (Error #3)
5. Remove unused imports (Error #4)
6. Fix inconsistent API base URL usage (Error #6)
