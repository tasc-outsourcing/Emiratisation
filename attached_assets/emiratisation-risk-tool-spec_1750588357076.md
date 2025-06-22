
# Emiratisation Risk Assessment Tool — Replit Vibe AI Spec  
**Client**: TASC Outsourcing  
**Goal**: Build a lead-gen microtool to calculate Emiratisation compliance risk and fines under UAE MoHRE 2025 laws.

---

## 🎯 Purpose
- Collect company data (location, sector, workforce)
- Determine if Emiratisation quotas apply
- Calculate compliance gap and potential fines
- Assign a risk score
- Convert users via call-to-action
- Capture leads
- Follow TASC branding

---

## 🧩 User Input Fields

### Company Profile
- **Company Location**: Mainland / Free Zone
- **Industry Sector**: 14 MoHRE sectors + Banking, Insurance, Government, Other
- **Total Employees**: number (min 1)
- **Skilled Employees**: number (min 1)
- **Part of a Group?**: Yes / No
  - If Yes → “Do any operate in Mainland?”: Yes / No

### Emirati Workforce
- **Number of Emiratis**: number
- **Are Emiratis in skilled roles?**: Yes / No
- **Are Emiratis WPS + GPSSA Compliant?**: Yes / No
- **Did any Emirati leave recently?**: Yes / No (+ optional date input)

### Lead Capture (Pop-up before result)
- First Name, Last Name, Email, Phone, Company Name

---

## ⚙️ Backend Logic

### Emiratisation Target Logic
```js
if (company_location === "Free Zone") {
  required_emiratis = 0;
} else if (total_employees >= 20 && total_employees <= 49 && is_mohre_designated_sector) {
  required_emiratis = 2;
} else if (skilled_employees >= 50) {
  required_emiratis = ceil(skilled_employees * emiratisation_target_percent / 100);
}
```

### Gap Calculation
```js
valid_emiratis = (wps_gp_ssa_compliant && in_skilled_roles) ? emirati_employees : 0;
if (emirati_left_recently && days_since_departure <= 90) {
  valid_emiratis += 1;
}
gap = max(0, required_emiratis - valid_emiratis);
```

### Fine Estimate
```js
fine_per_emirati = 96000;
total_fine = gap * fine_per_emirati;
```

### Risk Score Calculation
```js
score = 100 - (gap * 20);
if (gap >= 2) score -= 10;
if (wps_gp_ssa_compliant) score += 5;
```

### Risk Level
- 71–100: Low
- 41–70: Medium
- 0–40: High

---

## ⚠️ Conditional Disclaimer (Regulated Sectors)
If industry = Banking / Insurance / Government:

> Are you in a regulated industry? Emiratisation targets may differ from MoHRE rules.  
> 📞 [Book a Compliance Call](#)

---

## 🧾 Output Display
- Summary
- Emiratis required vs actual
- Gap
- Fine
- Score & Risk Level
- 3 CTA Cards:
  1. Book a Call
  2. Call Now
  3. Download Guide

---

## 🎨 Brand Style Guide

### Fonts
- Inter or Roboto

### Colors
```css
:root {
  --tasc-primary: #004267;
  --tasc-teal: #00A49E;
  --tasc-green: #3EB54A;
  --tasc-lightblue: #007FAD;
  --tasc-yellow: #FFC500;
}
```

### Components
- Header: 300px, bg: --tasc-primary
- Primary Button: --tasc-primary
- CTA: --tasc-yellow
- Card Radius: 12px

---

## 💾 Backend & Integration
- Store to Replit DB
- Send to HubSpot via webhook
```json
{
  "first_name": "John",
  "email": "john@example.com",
  "company": "Acme Corp",
  "risk_score": 55,
  "fine_estimate": 192000,
  "risk_level": "Medium"
}
```

---

## 🛠️ Admin Panel
- Set `emiratisation_target_percent` (default 8)
- Set `fine_per_emirati` (default 96000)
- Export results
- Toggle advanced logic

---

## 🧪 Test Cases

### Case 1
- Mainland, Construction, 50 skilled, 2 Emiratis
- Required = 4 → Gap = 2 → Score = 55 → Medium Risk

### Case 2
- Mainland, Education, 30 total, 2 Emiratis
- Required = 2 → Gap = 0 → Score = 100 → Low Risk

### Case 3
- Free Zone, Logistics
- Exempt

---
