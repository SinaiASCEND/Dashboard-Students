// AUTO-GENERATED from FULL-ISMMS_MD Program Academic Calendar AY 2026-27.pdf
// Structured calendar data — each event has date (or dateRange), label, class,
// section (semester), and kind for color-coding.
//
// kind: "module" | "exam" | "osce" | "holiday" | "break" | "ceremony" | "transition" | "block" | "other"
;(function(){

const E = (date, label, kind, opts) => ({
  date,                  // "2026-08-03"
  end: opts?.end,        // "2026-09-11" (optional)
  label,
  kind,
  weekday: opts?.weekday,
  className: opts?.class,       // "M1" | "M2" | "M3" | "M4"
  classLabel: opts?.classLabel, // "Class of 2030 — Phase 1"
  section: opts?.section,       // "Semester 1" etc.
  restricted: !!opts?.restricted,
});

window.ASCEND_CALENDAR_2026_27 = [
  // ─────────────────────────────────────────────────────────────────────
  // CLASS OF 2030 / 2029 — ASCEND PHASE 1 (M1 students in AY 2026-27)
  // ─────────────────────────────────────────────────────────────────────
  E("2026-07-27","Base Camp begins (ends 7/31)","transition",            {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-08-03","Orientation to ASCEND Phase 1 Semester 1","transition",{class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-08-03","Molecular, Cellular and Genomic Foundations Module begins (ends 9/11)","module", {end:"2026-09-11",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-08-06","Practice of Medicine I begins (ends 12/17)","module",  {end:"2026-12-17",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-08-11","THINQ Module begins (ends 12/1)","module",             {end:"2026-12-01",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-08-21","MCGF Mid-Module Exam","exam",                          {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-09-07","Labor Day","holiday",                                  {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-09-11","MCGF End-of-Module Exam","exam",                       {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-09-14","Anatomy Module begins (ends 10/23)","module",          {end:"2026-10-23",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-09-18","MD/PhD Retreat (ends 9/20)","other",                   {end:"2026-09-20",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-10-02","Anatomy Mid-Module Exam","exam",                       {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-10-05","Mid Semester 1 Pause","break",                         {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-10-08","POM I Mid-Module OSCE","osce",                         {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-10-21","Anatomy End-of-Module Practical","exam",               {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-10-23","Anatomy End-of-Module Exam","exam",                    {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-10-26","Foundations of Immunology & Microbiology Module begins (ends 11/24)","module", {end:"2026-11-24",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-11-24","FIM End-of-Module Exam","exam",                        {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-11-25","Thanksgiving Holiday Break (ends 11/27)","holiday",    {end:"2026-11-27",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-11-30","Pathology Module begins (ends 12/18)","module",        {end:"2026-12-18",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-12-10","POM I End-of-Module OSCE","osce",                      {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-12-14","THINQ End of Semester due date","other",               {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),
  E("2026-12-16","Pathology Practical","exam",                           {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-12-18","Pathology End-of-Module Exam","exam",                  {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1",restricted:true}),
  E("2026-12-21","Winter Break (ends 1/1)","break",                      {end:"2027-01-01",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 1"}),

  E("2027-01-04","Neuroscience Module begins (ends 2/12)","module",      {end:"2027-02-12",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-01-07","Practice of Medicine II Module begins (ends 6/11)","module", {end:"2027-06-11",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-01-18","Martin Luther King Day","holiday",                     {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-01-22","Neuroscience Mid-Module Exam","exam",                  {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-02-12","Neuroscience End-of-Module Exam","exam",               {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-02-15","Presidents’ Day","holiday",                            {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-02-16","Behavioral Science Module begins (ends 3/5)","module", {end:"2027-03-05",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-03-05","Behavioral Science End-of-Module Exam","exam",         {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-03-08","Cardiology Module begins (ends 4/9)","module",         {end:"2027-04-09",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-03-25","POM II Mid-Module OSCE","osce",                        {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-04-05","Medical Student Research Day","ceremony",              {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-04-09","Cardiology End-of-Module Exam","exam",                 {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-04-12","Spring Break (ends 4/16)","break",                     {end:"2027-04-16",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-04-19","Pulmonary Medicine Module begins (ends 5/14)","module",{end:"2027-05-14",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-05-14","Pulmonary End-of-Module Exam","exam",                  {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-05-17","Renal Module begins (ends 6/11)","module",             {end:"2027-06-11",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-05-31","Memorial Day","holiday",                               {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-06-11","Renal End-of-Module Exam","exam",                      {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-06-14","POM II Week (ends 6/18)","transition",                 {end:"2027-06-18",class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2",restricted:true}),
  E("2027-06-18","Juneteenth Observed","holiday",                        {class:"M1",classLabel:"Class of 2030 — Phase 1",section:"Semester 2"}),
  E("2027-06-21","Summer Break (ends 8/13)","break",                     {end:"2027-08-13",class:"M1",classLabel:"Class of 2030 — Phase 1"}),
  E("2027-08-16","Phase 1 Semester 3 Classes Resume","transition",       {class:"M1",classLabel:"Class of 2030 — Phase 1"}),

  // ─────────────────────────────────────────────────────────────────────
  // CLASS OF 2029 — ASCEND PHASE 1 → PHASE 2  (M2 in AY 2026-27)
  // ─────────────────────────────────────────────────────────────────────
  E("2026-08-10","Orientation to ASCEND Phase 1 Semester 3","transition",{class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-08-10","GU/Sexual Reproductive Health Module (ends 8/28)","module", {end:"2026-08-28",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-08-13","Practice of Medicine III begins (ends 12/11)","module",{end:"2026-12-11",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-08-18","THINQ Module begins (ends 11/17)","module",            {end:"2026-11-17",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-08-28","GU/SRH End-of-Module Exam","exam",                     {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-08-31","Endocrinology Module begins (ends 9/18)","module",     {end:"2026-09-18",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-09-07","Labor Day","holiday",                                  {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-09-18","Endocrinology End-of-Module Exam","exam",              {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-09-18","MD/PhD Retreat (ends 9/20)","other",                   {end:"2026-09-20",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-09-21","Gastroenterology Module begins (ends 10/16)","module", {end:"2026-10-16",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-10-01","POM III Mid-Module OSCE","osce",                       {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-10-16","Gastroenterology End-of-Module Exam","exam",           {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-10-19","Mid Semester 3 Pause","break",                         {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-10-20","Renal Module begins (ends 11/13)","module",            {end:"2026-11-13",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-11-13","Renal End-of-Module Exam","exam",                      {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-11-16","Musculoskeletal Module begins (ends 12/11)","module",  {end:"2026-12-11",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-11-25","Thanksgiving Holiday (ends 11/27)","holiday",          {end:"2026-11-27",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-11-30","THINQ End-of-Semester Assessment","other",             {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3"}),
  E("2026-12-03","POM III End-of-Module OSCE","osce",                    {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-12-11","Musculoskeletal End-of-Module Exam","exam",            {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-12-14","PEAKS 1 (ends 12/18)","transition",                    {end:"2026-12-18",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-12-18","Comprehensive Basic Science Exam (CBSE)","exam",       {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",section:"Semester 3",restricted:true}),
  E("2026-12-21","Winter Break (ends 1/1)","break",                      {end:"2027-01-01",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),

  E("2027-01-04","Dedicated Study Block (ends 2/12)","transition",       {end:"2027-02-12",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-01-18","Martin Luther King Day","holiday",                     {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-02-08","Last day to remediate any part of Phase 1","other",    {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-02-15","Presidents’ Day","holiday",                            {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-02-16","Transition to Phase 2 (ends 2/19)","transition",       {end:"2027-02-19",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-02-22","Rotation 1 begins (ends 4/2)","module",                {end:"2027-04-02",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-02-22","Palliative Care Clerkship 1 Orientation (ends 3/5)","transition", {end:"2027-03-05",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-03-19","Neurology NBME Shelf","exam",                          {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-03-22","Palliative Care Clerkship 2 Orientation (ends 4/2)","transition", {end:"2027-04-02",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-04-02","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-04-05","Medical Student Research Day","ceremony",              {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-04-07","CAMP 1 (ends 4/9)","transition",                       {end:"2027-04-09",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-04-12","Palliative Care Clerkship 3 Orientation (ends 4/24)","transition", {end:"2027-04-24",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-04-12","Rotation 2 begins (ends 5/21)","module",               {end:"2027-05-21",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-05-07","Neurology NBME Shelf","exam",                          {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-05-10","Palliative Care Clerkship 4 Orientation (ends 5/21)","transition", {end:"2027-05-21",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-05-21","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-05-26","CAMP 2 (ends 5/28)","transition",                      {end:"2027-05-28",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-05-31","Memorial Day","holiday",                               {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-06-01","Rotation 3 begins (ends 7/9)","module",                {end:"2027-07-09",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-06-01","Palliative Care Clerkship 5 Orientation (ends 6/11)","transition", {end:"2027-06-11",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-06-18","Juneteenth Observed","holiday",                        {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-06-25","Neurology NBME Shelf","exam",                          {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-06-28","Palliative Care Clerkship 6 Orientation (ends 7/10)","transition", {end:"2027-07-10",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-07-05","Independence Day Observed","holiday",                  {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-07-09","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-07-12","FlexTime (ends 7/16)","break",                         {end:"2027-07-16",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),
  E("2027-07-21","CAMP 3 (ends 7/23)","transition",                      {end:"2027-07-23",class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2",restricted:true}),
  E("2027-07-26","Start of New Academic Year — Rotation 4","transition", {class:"M2",classLabel:"Class of 2029 — Phase 1/Phase 2"}),

  // ─────────────────────────────────────────────────────────────────────
  // CLASS OF 2028 — ASCEND PHASE 2 → PHASE 3  (M3 in AY 2026-27)
  // ─────────────────────────────────────────────────────────────────────
  E("2026-07-27","Rotation 4 begins (ends 9/4)","module",                {end:"2026-09-04",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2026-07-27","Palliative Care Clerkship 7 Orientation (ends 8/7)","transition", {end:"2026-08-07",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-08-21","Neurology NBME Shelf","exam",                          {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-09-04","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-09-07","Labor Day","holiday",                                  {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2026-09-09","CAMP 4 (ends 9/11)","transition",                      {end:"2026-09-11",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-09-14","Rotation 5 begins (ends 10/23)","module",              {end:"2026-10-23",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2026-09-14","Palliative Care Clerkship 9 Orientation (ends 9/25)","transition", {end:"2026-09-25",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-10-09","Neurology NBME Shelf","exam",                          {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-10-23","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-10-28","CAMP 5 (ends 10/30)","transition",                     {end:"2026-10-30",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-11-02","Rotation 6 begins (ends 12/11)","module",              {end:"2026-12-11",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2026-11-25","Neurology NBME Shelf","exam",                          {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-11-26","Thanksgiving Holiday (ends 11/27)","holiday",          {end:"2026-11-27",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2026-12-11","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-12-16","CAMP 6 (ends 12/18)","transition",                     {end:"2026-12-18",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2026-12-21","Winter Break (ends 1/3)","break",                      {end:"2027-01-03",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),

  E("2027-01-04","Rotation 7 begins (ends 2/12)","module",               {end:"2027-02-12",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-01-18","MLK Jr. Day","holiday",                                {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-01-29","Neurology NBME Shelf","exam",                          {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2027-02-12","Pediatrics / Psych / Med / Surg-Anes / OB-GYN NBME Shelf Exams","exam", {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2027-02-15","Presidents’ Day","holiday",                            {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-02-16","PEAKS II Week (ends 2/19)","transition",               {end:"2027-02-19",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3",restricted:true}),
  E("2027-02-22","Transition to Phase 3 (ends 2/26)","transition",       {end:"2027-02-26",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-03-01","Block 0 starts (ends 3/12)","block",                   {end:"2027-03-12",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-03-15","Block 1 starts (ends 4/9)","block",                    {end:"2027-04-09",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-04-05","Medical Student Research Day","ceremony",              {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-04-12","Block 2 starts (ends 5/7)","block",                    {end:"2027-05-07",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-05-10","Block 3 starts (ends 6/4)","block",                    {end:"2027-06-04",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-06-07","Block 4 starts (ends 7/2)","block",                    {end:"2027-07-02",class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),
  E("2027-06-18","Juneteenth Observed","holiday",                        {class:"M3",classLabel:"Class of 2028 — Phase 2/Phase 3"}),

  // ─────────────────────────────────────────────────────────────────────
  // CLASS OF 2027 — LEGACY YEAR 4
  // ─────────────────────────────────────────────────────────────────────
  E("2026-06-29","Block F begins (ends 7/24)","block",                   {end:"2026-07-24",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-07-03","Independence Day Observed","holiday",                  {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-07-27","Block G begins (ends 8/21)","block",                   {end:"2026-08-21",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-08-24","Block H begins (ends 9/18)","block",                   {end:"2026-09-18",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-09-07","Labor Day","holiday",                                  {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-09-21","Block I begins (ends 10/16)","block",                  {end:"2026-10-16",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-10-19","Block J begins (ends 11/13)","block",                  {end:"2026-11-13",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-11-16","Block K (Interviews & Electives, no clerkships) begins (ends 12/18)","block", {end:"2026-12-18",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-11-27","Thanksgiving Holiday (ends 11/28)","holiday",          {end:"2026-11-28",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2026-12-21","Winter Break (ends 1/3)","break",                      {end:"2027-01-03",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-01-04","Block L begins (ends 1/29)","block",                   {end:"2027-01-29",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-01-18","MLK Day","holiday",                                    {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-02-01","Block M begins (ends 2/26)","block",                   {end:"2027-02-26",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-02-15","Presidents’ Day","holiday",                            {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-03-01","FlexTime (ends 3/5)","break",                          {end:"2027-03-05",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-03-08","InFocus 6,7,8 (ends 3/12) — Research Graduation Requirement due","other", {end:"2027-03-12",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-03-15","Match Week (ends 3/19)","ceremony",                    {end:"2027-03-19",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-03-19","Match Day","ceremony",                                 {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-03-22","Transition to Residency Course (ends 4/2)","transition", {end:"2027-04-02",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-04-05","Block O begins (ends 4/30)","block",                   {end:"2027-04-30",class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
  E("2027-05-15","Commencement (date TBD)","ceremony",                   {class:"M4",classLabel:"Class of 2027 — Legacy Year 4"}),
];

// Sort by date
window.ASCEND_CALENDAR_2026_27.sort((a, b) => a.date.localeCompare(b.date));
})();
