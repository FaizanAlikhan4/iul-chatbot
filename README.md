# IUL Admission Chatbot (Python + Claude API)

## Files
- `main.py`: backend (FastAPI). Fee table `courses.txt` se khud banata hai, math code karta hai, AI nahi.
- `courses.txt`: course-wise fee data. Format: `Faculty|Course|Duration|1st year fee|x` (x = 10k kam wala rule nahi lagta; `;` = Full Time;Evening)
- `info.md`: baaki sab jaankari (contact, admission, scholarship, hostel, placement)
- `widget.js`: website par lagne wala chat button
- `index.html`: test page

## Local par chalana
```
pip install -r requirements.txt
export GEMINI_API_KEY=your-key      # Windows: set GEMINI_API_KEY=your-key
# Claude use karna ho to: PROVIDER=anthropic aur ANTHROPIC_API_KEY set karo
uvicorn main:app --reload
```
Browser mein http://localhost:8000 kholo.

Gemini key aistudio.google.com se banti hai (Claude key console.anthropic.com se). Key kabhi website ke HTML/JS mein mat daalna, sirf server par rakhna.

## Website par lagana
Server deploy karne ke baad (Render, Railway ya college ka apna server), website ke page mein ye line daalo:
```
<script src="https://YOUR-SERVER/widget.js" defer></script>
```
Deploy karte waqt environment variables set karo: `GEMINI_API_KEY`, aur `ALLOWED_ORIGINS=https://www.iul.ac.in` (taaki sirf college ki site bot use kare).
Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Data badalna
`courses.txt` ya `info.md` edit karo aur server restart karo. Code badalne ki zaroorat nahi.

## Dhyan rakhne wali baatein
- Fee data abhi Prospectus 2017 + college ke bheje tables par hai. Naya fee aaye to `courses.txt` update karo.
- Default Gemini model `gemini-2.5-flash` hai. Agar error aaye to aistudio.google.com par current model ka naam dekhkar `MODEL` mein daal do.
- Har IP par 15 sawaal/minute ki limit hai (`RATE_LIMIT_PER_MIN`). Kharcha Anthropic console mein dekhte raho.
