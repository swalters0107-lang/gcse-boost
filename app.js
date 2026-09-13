
const BANK=[
{subject:"Maths",topic:"Percentages",grade:5,type:"mcq",q:"A £240 coat is reduced by 15%. What is the sale price?",a:["£36","£204","£216","£225"],correct:1,why:"15% of £240 = £36. £240 − £36 = £204."},
{subject:"Maths",topic:"Fractions",grade:5,type:"mcq",q:"What is 7/8 of 56?",a:["42","48","49","52"],correct:2,why:"56 ÷ 8 = 7, then 7 × 7 = 49."},
{subject:"Maths",topic:"Equations",grade:5,type:"typed",q:"Solve 5x + 8 = 38. Type only the value of x.",answer:"6",why:"Subtract 8: 5x=30. Divide by 5: x=6."},
{subject:"Maths",topic:"Ratio",grade:6,type:"mcq",q:"Share £96 in the ratio 5:3. What is the larger share?",a:["£36","£48","£60","£64"],correct:2,why:"8 parts total. £96÷8=£12. 5×£12=£60."},
{subject:"Maths",topic:"Sequences",grade:6,type:"typed",q:"The nth term is 3n + 2. What is the 20th term?",answer:"62",why:"3×20+2=62."},
{subject:"Maths",topic:"Probability",grade:6,type:"mcq",q:"A bag contains 4 red, 3 blue and 5 yellow counters. What is P(blue)?",a:["1/3","1/4","3/5","3/8"],correct:1,why:"12 counters total and 3 blue: 3/12=1/4."},
{subject:"Maths",topic:"Pythagoras",grade:7,type:"typed",q:"A right-angled triangle has shorter sides 8 cm and 15 cm. Find the hypotenuse in cm.",answer:"17",why:"8²+15²=64+225=289; √289=17."},
{subject:"Maths",topic:"Simultaneous equations",grade:7,type:"mcq",q:"x+y=13 and x−y=5. Find x.",a:["4","8","9","18"],correct:2,why:"Add the equations: 2x=18, so x=9."},
{subject:"Maths",topic:"Standard form",grade:7,type:"mcq",q:"Write 0.000072 in standard form.",a:["7.2×10⁻⁵","7.2×10⁻⁴","72×10⁻⁶","0.72×10⁻⁴"],correct:0,why:"Move the decimal 5 places right: 7.2×10⁻⁵."},

{subject:"English",topic:"Vocabulary",grade:4,type:"mcq",q:"Which word is closest in meaning to 'reluctant'?",a:["unwilling","excited","furious","careless"],correct:0,why:"Reluctant means unwilling or hesitant."},
{subject:"English",topic:"Inference",grade:5,type:"mcq",q:"'Aisha reread the message, locked her phone and pushed it beneath the cushion.' What is best inferred?",a:["She has lost her phone","The message may have unsettled her","She is going to sleep","Her phone is broken"],correct:1,why:"Her repeated reading and hiding of the phone suggest an emotional reaction without proving exactly what she feels."},
{subject:"English",topic:"Language analysis",grade:5,type:"mcq",q:"'Rain hammered the roof.' Which word most strongly creates a sense of violence?",a:["rain","hammered","the","roof"],correct:1,why:"'Hammered' is a forceful verb suggesting repeated violent impact."},
{subject:"English",topic:"Analysis paragraph",grade:6,type:"typed_text",q:"Write ONE analytical sentence about: ‘The corridor stretched ahead like a tunnel with no end.’ Include the quotation and explain its effect.",keywords:["like","tunnel","end"],why:"A strong answer identifies the simile/quotation and explains how it makes the corridor seem intimidating, endless or trapping."},
{subject:"English",topic:"Vocabulary",grade:6,type:"mcq",q:"Which verb best suggests someone looked quickly?",a:["glanced","stared","examined","observed"],correct:0,why:"'Glanced' means to look briefly or quickly."},
{subject:"English",topic:"Evaluation",grade:7,type:"mcq",q:"Which is the strongest analysis?",a:["The writer uses a verb.","The storm is scary.","The violent verb ‘slammed’ makes the storm seem aggressive, increasing the threat.","‘Slammed’ is a word."],correct:2,why:"It identifies the method, embeds evidence and explains an effect."},
{subject:"English",topic:"Structural analysis",grade:7,type:"typed_text",q:"In 1–2 sentences, explain why a writer might switch from long descriptive sentences to very short sentences during a chase.",keywords:["pace","tension","fast","urgency"],why:"A strong response links shorter sentences to faster pace, urgency and/or increased tension."},

{subject:"Science",topic:"Cells",grade:5,type:"mcq",q:"Where does most aerobic respiration take place in a cell?",a:["Nucleus","Mitochondria","Ribosomes","Cell membrane"],correct:1,why:"Mitochondria are the main site of aerobic respiration."},
{subject:"Science",topic:"Speed",grade:5,type:"typed",q:"A runner travels 180 m in 15 s. What is the average speed in m/s?",answer:"12",why:"Speed = distance ÷ time = 180÷15 = 12 m/s."},
{subject:"Science",topic:"Enzymes",grade:6,type:"mcq",q:"Why can high temperature stop an enzyme working?",a:["It freezes","The active site changes shape","It gains atoms","It becomes a carbohydrate"],correct:1,why:"High temperature can denature the enzyme, changing the active site's shape."},
{subject:"Science",topic:"Energy",grade:6,type:"typed",q:"A 3 kg object is raised 4 m. Use g=10 N/kg. Calculate GPE in joules.",answer:"120",why:"GPE=mgh=3×10×4=120 J."},
{subject:"Science",topic:"Variables",grade:6,type:"mcq",q:"The variable deliberately changed in an investigation is the:",a:["dependent","independent","control","anomalous"],correct:1,why:"The independent variable is deliberately changed."},
{subject:"Science",topic:"Genetics",grade:7,type:"mcq",q:"For Aa × Aa, what is the probability of offspring with genotype aa?",a:["0%","25%","50%","75%"],correct:1,why:"AA, Aa, Aa, aa gives 1 out of 4 = 25%."},

{subject:"History",topic:"Source inference",grade:4,type:"mcq",q:"A government poster strongly praises its own leader. What is especially important when using it as evidence?",a:["Its font","Its purpose and provenance","Its size","Its colour"],correct:1,why:"Who produced a source, when, and why can affect what it reveals and how it should be interpreted."},
{subject:"History",topic:"Causation",grade:5,type:"mcq",q:"Which opening best starts a developed causal explanation?",a:["It happened.","One important reason was X because...","The date was...","I think history is..."],correct:1,why:"It identifies a factor and immediately begins explaining the causal link."},
{subject:"History",topic:"Significance",grade:6,type:"mcq",q:"Which most strongly supports an argument that an event was significant?",a:["It had a short name","It caused widespread, lasting change","It happened first","It involved a famous person"],correct:1,why:"Scale, depth and duration of impact are strong measures of significance."},
{subject:"History",topic:"Judgement",grade:7,type:"typed_text",q:"In one sentence, explain what makes a strong GCSE History conclusion.",keywords:["factor","evidence","important","because","judgement"],why:"A strong conclusion weighs the main factors and gives a justified judgement about which mattered most."}
,
{subject:"Maths",topic:"Place value",grade:4,type:"mcq",q:"Which is the largest number?",a:["0.57","0.507","0.75","0.705"],correct:2,why:"0.75 is greater than 0.705, 0.57 and 0.507."},
{subject:"Maths",topic:"Negative numbers",grade:4,type:"typed",q:"Calculate −7 + 12.",answer:"5",why:"Moving 12 places right from −7 gives 5."},
{subject:"Maths",topic:"Percentages",grade:4,type:"typed",q:"Find 10% of £350.",answer:"35",why:"10% means divide by 10: £350 ÷ 10 = £35."},
{subject:"Maths",topic:"Fractions",grade:4,type:"mcq",q:"Which fraction is equivalent to 3/5?",a:["6/15","9/15","12/25","15/20"],correct:1,why:"Multiply numerator and denominator by 3: 3/5 = 9/15."},
{subject:"Maths",topic:"Area",grade:4,type:"typed",q:"A rectangle is 9 cm by 6 cm. Find its area in cm².",answer:"54",why:"Area = length × width = 9 × 6 = 54 cm²."},
{subject:"Maths",topic:"Mean",grade:4,type:"typed",q:"Find the mean of 4, 7, 9 and 12.",answer:"8",why:"Total = 32. Divide by 4 to get 8."},
{subject:"Maths",topic:"Angles",grade:4,type:"typed",q:"Two angles on a straight line are 127° and x°. Find x.",answer:"53",why:"Angles on a straight line total 180°. 180−127=53."},
{subject:"Maths",topic:"Best buys",grade:5,type:"mcq",q:"4 drinks cost £3.20. At the same rate, how much do 7 cost?",a:["£4.80","£5.20","£5.60","£6.40"],correct:2,why:"One costs £0.80, so 7 cost £5.60."},
{subject:"Maths",topic:"Reverse percentages",grade:5,type:"mcq",q:"After a 20% discount an item costs £64. What was the original price?",a:["£76.80","£80","£84","£96"],correct:1,why:"£64 is 80% of the original. 64 ÷ 0.8 = 80."},
{subject:"Maths",topic:"Linear graphs",grade:5,type:"mcq",q:"For y=3x−2, what is y when x=4?",a:["8","10","12","14"],correct:1,why:"y=3×4−2=10."},
{subject:"Maths",topic:"Circumference",grade:5,type:"mcq",q:"A circle has diameter 10 cm. Which expression gives its circumference?",a:["5π","10π","20π","100π"],correct:1,why:"Circumference = π × diameter = 10π."},
{subject:"Maths",topic:"Probability",grade:5,type:"mcq",q:"P(rain)=0.35. What is P(no rain)?",a:["0.35","0.55","0.65","1.35"],correct:2,why:"Complementary probabilities total 1: 1−0.35=0.65."},
{subject:"Maths",topic:"Indices",grade:5,type:"mcq",q:"Simplify a³ × a⁴.",a:["a⁷","a¹²","2a⁷","a"],correct:0,why:"When multiplying powers with the same base, add the indices: 3+4=7."},
{subject:"Maths",topic:"Factorising",grade:6,type:"mcq",q:"Factorise x²+7x.",a:["x(x+7)","x(x−7)","7(x+1)","x²(7x)"],correct:0,why:"Both terms share a factor x: x(x+7)."},
{subject:"Maths",topic:"Quadratics",grade:6,type:"mcq",q:"Solve x²=49.",a:["x=7 only","x=−7 only","x=7 or −7","x=49"],correct:2,why:"Both 7² and (−7)² equal 49."},
{subject:"Maths",topic:"Trigonometry",grade:6,type:"mcq",q:"In a right triangle, relative to angle θ, sin θ equals:",a:["adjacent/hypotenuse","opposite/hypotenuse","opposite/adjacent","hypotenuse/opposite"],correct:1,why:"SOH: sine = opposite ÷ hypotenuse."},
{subject:"Maths",topic:"Inequalities",grade:6,type:"mcq",q:"Solve 2x+3>11.",a:["x>4","x<4","x>7","x<7"],correct:0,why:"2x>8, so x>4."},
{subject:"Maths",topic:"Functions",grade:7,type:"typed",q:"f(x)=2x²−1. Find f(3).",answer:"17",why:"2×3²−1=18−1=17."},
{subject:"Maths",topic:"Surds",grade:7,type:"mcq",q:"Simplify √50.",a:["5√2","10√5","25√2","2√25"],correct:0,why:"√50=√(25×2)=5√2."},
{subject:"Maths",topic:"Quadratics",grade:7,type:"mcq",q:"Factorise x²−5x+6.",a:["(x−1)(x−6)","(x−2)(x−3)","(x+2)(x+3)","(x−6)(x+1)"],correct:1,why:"−2 and −3 multiply to +6 and add to −5."},

{subject:"Science",topic:"Cells",grade:4,type:"mcq",q:"Which structure controls movement of substances into and out of a cell?",a:["Nucleus","Cell membrane","Cytoplasm","Ribosome"],correct:1,why:"The cell membrane controls movement into and out of the cell."},
{subject:"Science",topic:"Organisation",grade:4,type:"mcq",q:"Which sequence is correct?",a:["organ→cell→tissue","cell→tissue→organ","tissue→cell→organ","cell→organ→tissue"],correct:1,why:"Cells form tissues; tissues form organs."},
{subject:"Science",topic:"Photosynthesis",grade:4,type:"mcq",q:"Which gas is taken in during photosynthesis?",a:["oxygen","nitrogen","carbon dioxide","hydrogen"],correct:2,why:"Plants use carbon dioxide and water to make glucose during photosynthesis."},
{subject:"Science",topic:"Particles",grade:4,type:"mcq",q:"In a gas, particles are:",a:["fixed in place","close and vibrating only","far apart and moving randomly","joined in a lattice"],correct:2,why:"Gas particles are far apart and move rapidly in random directions."},
{subject:"Science",topic:"Atomic structure",grade:4,type:"mcq",q:"Which particle has a positive charge?",a:["electron","neutron","proton","atom"],correct:2,why:"Protons are positive, electrons negative and neutrons neutral."},
{subject:"Science",topic:"Forces",grade:4,type:"typed",q:"A 20 N force acts on an area of 4 m². Calculate pressure in N/m².",answer:"5",why:"Pressure = force ÷ area = 20÷4 = 5 N/m²."},
{subject:"Science",topic:"Electricity",grade:4,type:"mcq",q:"What is the unit of electric current?",a:["volt","ampere","ohm","watt"],correct:1,why:"Electric current is measured in amperes (A)."},
{subject:"Science",topic:"Ecology",grade:5,type:"mcq",q:"What do decomposers do?",a:["make sunlight","break down dead material","eat only plants","produce oxygen only"],correct:1,why:"Decomposers break down dead organisms and waste, recycling materials."},
{subject:"Science",topic:"Homeostasis",grade:5,type:"mcq",q:"Which hormone lowers blood glucose concentration?",a:["adrenaline","insulin","thyroxine","testosterone"],correct:1,why:"Insulin helps lower blood glucose concentration."},
{subject:"Science",topic:"Rates",grade:5,type:"mcq",q:"Increasing temperature usually increases reaction rate because particles:",a:["become larger","collide more often and with more energy","lose all energy","stop moving"],correct:1,why:"Higher temperature increases kinetic energy and successful collision frequency."},
{subject:"Science",topic:"Acids",grade:5,type:"mcq",q:"A solution with pH 2 is:",a:["strongly acidic","neutral","weakly alkaline","strongly alkaline"],correct:0,why:"Values below pH 7 are acidic; pH 2 is strongly acidic."},
{subject:"Science",topic:"Energy",grade:5,type:"mcq",q:"Which energy store increases when an object is lifted?",a:["thermal","chemical","gravitational potential","nuclear"],correct:2,why:"Lifting increases the gravitational potential energy store."},
{subject:"Science",topic:"Waves",grade:5,type:"mcq",q:"Wave speed equals:",a:["frequency÷wavelength","frequency×wavelength","wavelength÷frequency","time×distance"],correct:1,why:"Wave speed = frequency × wavelength."},
{subject:"Science",topic:"Magnification",grade:6,type:"typed",q:"An image is 40 mm and the real object is 0.5 mm. Calculate magnification.",answer:"80",why:"Magnification=image size÷real size=40÷0.5=80."},
{subject:"Science",topic:"Moles",grade:6,type:"mcq",q:"Relative formula mass of CO₂ is 44. How many moles are in 88 g?",a:["0.5","1","2","4"],correct:2,why:"Moles=mass÷Mr=88÷44=2."},
{subject:"Science",topic:"Electricity",grade:6,type:"typed",q:"A current of 3 A flows through a 4 Ω resistor. Calculate potential difference in volts.",answer:"12",why:"V=IR=3×4=12 V."},
{subject:"Science",topic:"Forces",grade:6,type:"typed",q:"A 5 kg object accelerates at 3 m/s². Calculate resultant force in N.",answer:"15",why:"F=ma=5×3=15 N."},
{subject:"Science",topic:"Inheritance",grade:7,type:"mcq",q:"Why can a recessive allele be carried without showing in the phenotype?",a:["It disappears","A dominant allele can mask it","It becomes a chromosome","It is always harmful"],correct:1,why:"In a heterozygote, a dominant allele can mask a recessive allele."},
{subject:"Science",topic:"Equilibrium",grade:7,type:"mcq",q:"For an exothermic reversible reaction at equilibrium, increasing temperature tends to favour:",a:["the exothermic direction","the endothermic direction","neither direction ever","only catalysts"],correct:1,why:"The equilibrium shifts in the endothermic direction to oppose the temperature increase."},

{subject:"English",topic:"Vocabulary",grade:4,type:"mcq",q:"Which word is closest to 'vivid'?",a:["dull","clear and striking","silent","ordinary"],correct:1,why:"Vivid means producing strong, clear images or impressions."},
{subject:"English",topic:"Inference",grade:4,type:"mcq",q:"'Ben kept his coat on and stood beside the door.' What is a sensible inference?",a:["He may be ready to leave","He hates coats","The door is broken","He is asleep"],correct:0,why:"His coat and position by the door reasonably suggest he may be ready to leave."},
{subject:"English",topic:"Language analysis",grade:5,type:"mcq",q:"'The city never sleeps.' Which technique is most clearly used?",a:["personification","simile","rhyme","onomatopoeia"],correct:0,why:"The city is given the human action of sleeping."},
{subject:"English",topic:"Evidence",grade:5,type:"mcq",q:"Which quotation best supports the idea that a character is nervous?",a:["'She smiled.'","'His hands trembled as he reached for the handle.'","'The room was blue.'","'He ate lunch.'"],correct:1,why:"Trembling hands are direct textual evidence of nervousness."},
{subject:"English",topic:"Vocabulary",grade:6,type:"mcq",q:"Which adjective most strongly suggests a place is dangerously neglected?",a:["old","quiet","derelict","small"],correct:2,why:"Derelict suggests serious neglect and disrepair."},
{subject:"English",topic:"Analysis paragraph",grade:6,type:"typed_text",q:"Write one analytical sentence about: ‘The moon hung like a watchful eye.’ Explain an effect.",keywords:["simile","eye","watch","uneasy","watched","threat","tension"],why:"A strong answer notices the simile and links the 'watchful eye' to being observed, unease or tension."},
{subject:"English",topic:"Evaluation",grade:7,type:"typed_text",q:"In 1–2 sentences, explain why precise verbs can be more effective than general verbs in descriptive writing.",keywords:["precise","image","effect","specific","reader","meaning"],why:"Strong answers explain that precise verbs create a clearer image and more specific effect for the reader."},

{subject:"History",topic:"Chronology",grade:4,type:"mcq",q:"What does chronology mean?",a:["judging a source","putting events in time order","comparing countries","memorising quotations"],correct:1,why:"Chronology is the order in which events happened."},
{subject:"History",topic:"Evidence",grade:5,type:"mcq",q:"Why is it useful to compare two historical sources?",a:["To make the answer longer","To identify agreements, differences and perspectives","Because one must be false","To avoid using context"],correct:1,why:"Comparison helps evaluate what different sources reveal and why they may differ."},
{subject:"History",topic:"Causation",grade:6,type:"typed_text",q:"Write one sentence showing how you would link a cause to its consequence in a GCSE History answer.",keywords:["because","led","therefore","result","caused","meant"],why:"A developed causal sentence explicitly connects the factor to an outcome."},
{subject:"History",topic:"Judgement",grade:7,type:"mcq",q:"Which conclusion is strongest?",a:["Factor A mattered.","All factors were the same.","Factor A was most important because its effects were wider and longer-lasting, although B accelerated the change.","I liked factor A."],correct:2,why:"It makes a comparative, qualified judgement and justifies it."}

,
{subject:"English",topic:"Reading comprehension",grade:4,type:"mcq",q:"Read: ‘The bus arrived late. Priya looked at the station clock, sighed, and tightened her grip on the folder.’ Why is Priya most likely concerned?",a:["She dislikes buses","She may be late for something important","The folder is heavy","She cannot read the clock"],correct:1,why:"The late bus, clock-checking and sighing together imply concern about being late."},
{subject:"English",topic:"Meaning in context",grade:4,type:"mcq",q:"In ‘The path dwindled into a narrow track’, what does ‘dwindled’ most nearly mean?",a:["became smaller","became brighter","became louder","became safer"],correct:0,why:"In context, ‘dwindled’ means reduced or became smaller."},
{subject:"English",topic:"Retrieval",grade:4,type:"mcq",q:"Read: ‘At six o’clock, the shopkeeper pulled down the shutters and carried two boxes into the storeroom.’ What did the shopkeeper carry?",a:["shutters","two boxes","a clock","a sign"],correct:1,why:"This is explicit retrieval: the text directly states ‘two boxes’."},
{subject:"English",topic:"Inference",grade:5,type:"mcq",q:"Read: ‘Marcus laughed with the others, but under the table his hands were clenched into fists.’ What contrast is created?",a:["He looks calm but may feel angry or tense","He is asleep","He dislikes tables","He is definitely happy"],correct:0,why:"His outward laughter contrasts with clenched fists, suggesting concealed tension or anger."},
{subject:"English",topic:"Summary",grade:5,type:"mcq",q:"Which is the best summary? ‘The storm damaged roads overnight. By morning, volunteers were clearing branches while engineers inspected a bridge.’",a:["There was some weather.","A storm caused damage and people began recovery work.","Volunteers built a new bridge.","Engineers caused the storm."],correct:1,why:"It captures both the damage and the response without adding unsupported detail."},
{subject:"English",topic:"Language effect",grade:5,type:"mcq",q:"‘The alarm shrieked through the silent house.’ What does ‘shrieked’ suggest?",a:["A soft pleasant sound","A sudden harsh and alarming sound","Complete silence","A slow movement"],correct:1,why:"‘Shrieked’ suggests a piercing, harsh sound, intensified by the contrast with silence."},
{subject:"English",topic:"Evidence",grade:5,type:"typed_text",q:"Read: ‘Leah hovered by the doorway, rehearsing the first sentence again in her head.’ In one sentence, explain what this suggests about Leah. Use evidence.",keywords:["nervous","anxious","uncertain","doorway","rehears","hesitant"],why:"A strong answer makes an inference such as nervousness or uncertainty and supports it with ‘hovered’ or ‘rehearsing’."},
{subject:"English",topic:"Language analysis",grade:6,type:"typed_text",q:"Analyse: ‘The abandoned factory crouched beneath the grey sky.’ Write 1–2 sentences about the writer’s language.",keywords:["personification","crouched","threat","sinister","animal","human","uneasy","menacing"],why:"A strong response identifies ‘crouched’ as personification and explores how it can make the factory seem animal-like, threatening or sinister."},
{subject:"English",topic:"Structure",grade:6,type:"mcq",q:"A passage begins with a wide view of a crowded station, then focuses closely on one abandoned suitcase. Why might the writer do this?",a:["To change the font","To focus attention and create curiosity or tension","To prove the station is empty","To remove all detail"],correct:1,why:"Shifting from a broad view to one object directs the reader’s attention and can create curiosity or tension."},
{subject:"English",topic:"Comparison",grade:6,type:"mcq",q:"Text A calls city life ‘electric and exhilarating’. Text B calls it ‘relentless and exhausting’. What is the clearest comparison?",a:["Both dislike cities","A is positive while B is negative","Both are neutral","Neither expresses a viewpoint"],correct:1,why:"The adjective choices convey contrasting positive and negative perspectives."},
{subject:"English",topic:"Evaluation",grade:6,type:"typed_text",q:"A writer describes a rescue as ‘a miracle of courage’. In one sentence, evaluate whether this is effective and give a reason.",keywords:["effective","courage","miracle","emphas","hero","dramatic","reader"],why:"Evaluation needs a judgement plus a reason grounded in the writer’s wording and its effect."},
{subject:"English",topic:"Implicit meaning",grade:7,type:"mcq",q:"‘He congratulated her warmly, then watched the trophy leave the room without blinking.’ Which interpretation is most nuanced?",a:["He is certainly furious","His words are supportive, but his fixed attention on the trophy may hint at concealed disappointment or envy","He cannot blink","He owns the trophy"],correct:1,why:"A nuanced inference recognises the contrast while avoiding claiming an emotion as certain."},
{subject:"English",topic:"Language analysis",grade:7,type:"typed_text",q:"Analyse: ‘Hope flickered, fragile as a candle in a storm.’ Explain how the image shapes the reader’s view of hope.",keywords:["simile","fragile","candle","storm","vulnerable","hope","contrast","threat"],why:"A strong analysis explores the simile: hope exists, but is vulnerable against a much stronger threatening force."},
{subject:"English",topic:"Critical evaluation",grade:7,type:"typed_text",q:"Write 2 sentences evaluating the statement: ‘The writer makes the setting feel completely hopeless.’ Refer to the phrase ‘a thin blade of sunlight cut beneath the door’.",keywords:["agree","disagree","sunlight","hope","thin","contrast","completely","suggest"],why:"A strong response evaluates the word ‘completely’: the small image of sunlight can imply a trace of hope, allowing a qualified judgement."},
{subject:"English",topic:"Vocabulary ladder",grade:5,type:"mcq",q:"Choose the strongest upgrade for ‘The man was very angry.’",a:["The man was not happy.","The man was furious.","The man was angry.","The man felt a thing."],correct:1,why:"‘Furious’ is a precise, stronger adjective and avoids relying on ‘very’."},
{subject:"English",topic:"Vocabulary ladder",grade:6,type:"mcq",q:"Which word best describes a short-lived feeling or event?",a:["permanent","fleeting","immovable","eternal"],correct:1,why:"‘Fleeting’ means lasting for only a short time."},
{subject:"English",topic:"Vocabulary ladder",grade:7,type:"mcq",q:"Which word best means ‘present everywhere or seeming to be everywhere’?",a:["scarce","ubiquitous","fragile","reluctant"],correct:1,why:"‘Ubiquitous’ means widespread or seemingly present everywhere."},
{subject:"English",topic:"Sentence control",grade:5,type:"mcq",q:"Which sentence is punctuated correctly?",a:["Although it was raining we continued.","Although it was raining, we continued.","Although, it was raining we continued.","Although it was, raining we continued."],correct:1,why:"The introductory subordinate clause is followed by a comma."},
{subject:"English",topic:"Sentence control",grade:6,type:"mcq",q:"Which sentence uses a semicolon correctly?",a:["The road was flooded; we took another route.","The road; was flooded we took another route.","The road was; flooded.","The; road was flooded, we took another route."],correct:0,why:"A semicolon can link two closely related independent clauses."},
{subject:"English",topic:"Writing craft",grade:7,type:"typed_text",q:"Rewrite ‘It was scary’ as one vivid sentence without using the word ‘scary’.",keywords:["shadow","heart","dark","breath","silence","cold","trembl","pulse","fear","door","sound"],why:"Effective descriptive writing shows fear through precise sensory detail, action or imagery instead of simply naming the emotion."}
,
{"subject": "Maths", "topic": "Number", "grade": 4, "type": "mcq", "q": "What is the HCF of 18 and 24?", "a": ["3", "6", "9", "12"], "correct": 1, "why": "6 is the greatest factor common to both 18 and 24."},
{"subject": "Maths", "topic": "Number", "grade": 4, "type": "mcq", "q": "What is the LCM of 6 and 8?", "a": ["12", "24", "36", "48"], "correct": 1, "why": "24 is the smallest positive multiple shared by 6 and 8."},
{"subject": "Maths", "topic": "Rounding", "grade": 4, "type": "mcq", "q": "Round 7.846 to 2 decimal places.", "a": ["7.84", "7.85", "7.80", "7.86"], "correct": 1, "why": "The third decimal is 6, so 7.84 rounds up to 7.85."},
{"subject": "Maths", "topic": "Fractions", "grade": 4, "type": "mcq", "q": "Calculate 1/3 + 1/6.", "a": ["1/9", "1/2", "2/9", "2/6"], "correct": 1, "why": "1/3=2/6, so 2/6+1/6=3/6=1/2."},
{"subject": "Maths", "topic": "Ratio", "grade": 4, "type": "mcq", "q": "Simplify 18:30.", "a": ["3:5", "6:10", "9:15", "2:3"], "correct": 0, "why": "Divide both parts by 6 to get 3:5."},
{"subject": "Maths", "topic": "Percentages", "grade": 4, "type": "mcq", "q": "Increase £50 by 10%.", "a": ["£55", "£60", "£45", "£51"], "correct": 0, "why": "10% of £50 is £5, so the new amount is £55."},
{"subject": "Maths", "topic": "Algebra", "grade": 4, "type": "mcq", "q": "Simplify 3a+5a.", "a": ["8", "8a", "15a", "a8"], "correct": 1, "why": "Like terms add: 3a+5a=8a."},
{"subject": "Maths", "topic": "Coordinates", "grade": 4, "type": "mcq", "q": "Which point lies on the y-axis?", "a": ["(3,0)", "(0,4)", "(2,2)", "(-3,1)"], "correct": 1, "why": "Every point on the y-axis has x-coordinate 0."},
{"subject": "Maths", "topic": "Angles", "grade": 4, "type": "mcq", "q": "Angles in a triangle total:", "a": ["90°", "180°", "270°", "360°"], "correct": 1, "why": "Interior angles in any triangle total 180°."},
{"subject": "Maths", "topic": "Statistics", "grade": 4, "type": "mcq", "q": "What is the median of 2,4,7,9,12?", "a": ["4", "7", "9", "6.8"], "correct": 1, "why": "The middle value in order is 7."},
{"subject": "Maths", "topic": "Probability", "grade": 4, "type": "mcq", "q": "A fair coin is tossed. P(heads)?", "a": ["0", "1/4", "1/2", "1"], "correct": 2, "why": "A fair coin has two equally likely outcomes."},
{"subject": "Maths", "topic": "Area", "grade": 5, "type": "mcq", "q": "Area of a triangle with base 10 cm and height 7 cm?", "a": ["17", "35", "70", "140"], "correct": 1, "why": "Area=1/2×base×height=35 cm²."},
{"subject": "Maths", "topic": "Volume", "grade": 5, "type": "mcq", "q": "Volume of a cuboid 3×4×5 cm?", "a": ["12", "20", "47", "60"], "correct": 3, "why": "Volume=3×4×5=60 cm³."},
{"subject": "Maths", "topic": "Speed", "grade": 5, "type": "mcq", "q": "A car travels 150 km in 3 hours. Average speed?", "a": ["45 km/h", "50 km/h", "75 km/h", "450 km/h"], "correct": 1, "why": "Speed=distance÷time=150÷3=50 km/h."},
{"subject": "Maths", "topic": "Proportion", "grade": 5, "type": "mcq", "q": "5 pens cost £3. How much do 15 pens cost?", "a": ["£6", "£8", "£9", "£15"], "correct": 2, "why": "15 is three times 5, so the cost is 3×£3=£9."},
{"subject": "Maths", "topic": "Algebra", "grade": 5, "type": "mcq", "q": "Solve 7x=42.", "a": ["5", "6", "7", "49"], "correct": 1, "why": "Divide both sides by 7: x=6."},
{"subject": "Maths", "topic": "Algebra", "grade": 5, "type": "mcq", "q": "Expand 3(x+5).", "a": ["3x+5", "3x+15", "8x", "15x"], "correct": 1, "why": "Multiply both terms by 3."},
{"subject": "Maths", "topic": "Sequences", "grade": 5, "type": "mcq", "q": "Next term: 4,9,14,19,...", "a": ["23", "24", "25", "29"], "correct": 1, "why": "The sequence increases by 5."},
{"subject": "Maths", "topic": "Graphs", "grade": 5, "type": "mcq", "q": "The gradient of y=4x+1 is:", "a": ["1", "4", "5", "-4"], "correct": 1, "why": "In y=mx+c, m is the gradient."},
{"subject": "Maths", "topic": "Transformations", "grade": 5, "type": "mcq", "q": "A reflection changes a shape's:", "a": ["size", "orientation", "area", "side lengths"], "correct": 1, "why": "A reflection reverses orientation but preserves lengths and area."},
{"subject": "Maths", "topic": "Pythagoras", "grade": 5, "type": "mcq", "q": "A right triangle has hypotenuse 13 and one leg 5. Other leg?", "a": ["8", "10", "12", "18"], "correct": 2, "why": "13²−5²=169−25=144; √144=12."},
{"subject": "Maths", "topic": "Standard form", "grade": 5, "type": "mcq", "q": "Write 3,400,000 in standard form.", "a": ["3.4×10⁶", "34×10⁵", "3.4×10⁵", "0.34×10⁷"], "correct": 0, "why": "Standard form requires a number from 1 to less than 10: 3.4×10⁶."},
{"subject": "Maths", "topic": "Bounds", "grade": 6, "type": "mcq", "q": "A length is 8 cm correct to nearest cm. Lower bound?", "a": ["7", "7.5", "8", "8.5"], "correct": 1, "why": "Values from 7.5 up to but not including 8.5 round to 8."},
{"subject": "Maths", "topic": "Algebra", "grade": 6, "type": "mcq", "q": "Rearrange y=3x+4 to make x the subject.", "a": ["x=(y-4)/3", "x=3y+4", "x=(y+4)/3", "x=y-7"], "correct": 0, "why": "Subtract 4 then divide by 3."},
{"subject": "Maths", "topic": "Quadratics", "grade": 6, "type": "mcq", "q": "Expand (x+3)(x+2).", "a": ["x²+5x+6", "x²+6x+5", "x²+5", "2x+6"], "correct": 0, "why": "Multiply each term: x²+2x+3x+6."},
{"subject": "Maths", "topic": "Trigonometry", "grade": 6, "type": "mcq", "q": "Which ratio is adjacent/hypotenuse?", "a": ["sin", "cos", "tan", "none"], "correct": 1, "why": "CAH: cosine=adjacent/hypotenuse."},
{"subject": "Maths", "topic": "Similarity", "grade": 6, "type": "mcq", "q": "Two similar shapes have scale factor 3 for length. Area scale factor?", "a": ["3", "6", "9", "27"], "correct": 2, "why": "Area scale factor is the square: 3²=9."},
{"subject": "Maths", "topic": "Probability", "grade": 6, "type": "mcq", "q": "If P(A)=0.4 and P(B)=0.3 for mutually exclusive events, P(A or B)?", "a": ["0.12", "0.7", "0.1", "1.2"], "correct": 1, "why": "For mutually exclusive events, add probabilities: 0.4+0.3=0.7."},
{"subject": "Maths", "topic": "Indices", "grade": 7, "type": "mcq", "q": "Simplify x⁶ ÷ x².", "a": ["x³", "x⁴", "x⁸", "x¹²"], "correct": 1, "why": "Subtract indices: 6−2=4."},
{"subject": "Maths", "topic": "Functions", "grade": 7, "type": "mcq", "q": "If f(x)=3x+1, find f(-2).", "a": ["-7", "-5", "5", "7"], "correct": 1, "why": "3(-2)+1=-6+1=-5."},
{"subject": "Science", "topic": "Cell biology", "grade": 4, "type": "mcq", "q": "Which structure contains genetic material in an animal cell?", "a": ["cell wall", "nucleus", "vacuole", "chloroplast"], "correct": 1, "why": "The nucleus contains the cell's genetic material."},
{"subject": "Science", "topic": "Cell biology", "grade": 5, "type": "mcq", "q": "What is diffusion?", "a": ["movement from low to high concentration only", "net movement from high to low concentration", "movement requiring respiration always", "cell division"], "correct": 1, "why": "Diffusion is net movement down a concentration gradient."},
{"subject": "Science", "topic": "Organisation", "grade": 5, "type": "mcq", "q": "Which organ pumps blood around the body?", "a": ["lung", "kidney", "heart", "liver"], "correct": 2, "why": "The heart pumps blood through the circulatory system."},
{"subject": "Science", "topic": "Infection", "grade": 5, "type": "mcq", "q": "Antibiotics are used against:", "a": ["viruses", "bacteria", "all pathogens equally", "cancer cells"], "correct": 1, "why": "Antibiotics target bacteria, not viruses."},
{"subject": "Science", "topic": "Bioenergetics", "grade": 5, "type": "mcq", "q": "Which substance is made during photosynthesis?", "a": ["glucose", "urea", "lactic acid only", "nitrogen"], "correct": 0, "why": "Photosynthesis produces glucose."},
{"subject": "Science", "topic": "Homeostasis", "grade": 5, "type": "mcq", "q": "The kidneys help control:", "a": ["blood water balance", "eye colour", "bone length only", "air pressure"], "correct": 0, "why": "Kidneys regulate water and ion balance and remove urea."},
{"subject": "Science", "topic": "Inheritance", "grade": 5, "type": "mcq", "q": "A gene is best described as:", "a": ["a type of cell", "a section of DNA coding for a characteristic/protein", "an organ", "a chromosome pair"], "correct": 1, "why": "A gene is a section of DNA that carries genetic information."},
{"subject": "Science", "topic": "Ecology", "grade": 5, "type": "mcq", "q": "A quadrat is commonly used to estimate:", "a": ["speed", "abundance/distribution of organisms", "blood pressure", "atomic mass"], "correct": 1, "why": "Quadrats sample organisms in an area."},
{"subject": "Science", "topic": "Atomic structure", "grade": 4, "type": "mcq", "q": "Atomic number equals number of:", "a": ["neutrons", "protons", "shells", "molecules"], "correct": 1, "why": "Atomic number is the number of protons."},
{"subject": "Science", "topic": "Periodic table", "grade": 5, "type": "mcq", "q": "Elements in the same group have similar chemical properties because they have:", "a": ["same mass", "same outer-shell electron pattern", "same neutron number", "same state"], "correct": 1, "why": "Group chemistry is linked to outer-shell electrons."},
{"subject": "Science", "topic": "Bonding", "grade": 5, "type": "mcq", "q": "Ionic bonding involves:", "a": ["shared pairs only", "electrostatic attraction between oppositely charged ions", "no particles", "only metals"], "correct": 1, "why": "Ionic compounds contain oppositely charged ions held by electrostatic attraction."},
{"subject": "Science", "topic": "Quantitative chemistry", "grade": 5, "type": "mcq", "q": "Conservation of mass means total mass in a closed reaction:", "a": ["increases", "decreases", "stays the same", "becomes zero"], "correct": 2, "why": "Atoms are rearranged, not created or destroyed."},
{"subject": "Science", "topic": "Chemical changes", "grade": 5, "type": "mcq", "q": "At the cathode during electrolysis, positive ions:", "a": ["gain electrons", "lose electrons", "become neutrons", "evaporate"], "correct": 0, "why": "Positive ions are reduced by gaining electrons."},
{"subject": "Science", "topic": "Energy changes", "grade": 5, "type": "mcq", "q": "An exothermic reaction transfers energy:", "a": ["from surroundings to reaction only", "to the surroundings", "nowhere", "into mass"], "correct": 1, "why": "Exothermic reactions release energy to the surroundings."},
{"subject": "Science", "topic": "Rates", "grade": 6, "type": "mcq", "q": "A catalyst increases reaction rate by:", "a": ["increasing product mass", "providing a lower activation-energy pathway", "raising concentration automatically", "being used up"], "correct": 1, "why": "Catalysts provide an alternative pathway with lower activation energy."},
{"subject": "Science", "topic": "Organic chemistry", "grade": 6, "type": "mcq", "q": "The general formula of alkanes is:", "a": ["CnH2n", "CnH2n+2", "CnH2n-2", "CHn"], "correct": 1, "why": "Alkanes have general formula CnH2n+2."},
{"subject": "Science", "topic": "Atmosphere", "grade": 5, "type": "mcq", "q": "The largest component of today's atmosphere is:", "a": ["oxygen", "carbon dioxide", "nitrogen", "argon"], "correct": 2, "why": "Nitrogen makes up about 78% of the atmosphere."},
{"subject": "Science", "topic": "Energy", "grade": 4, "type": "mcq", "q": "Power is measured in:", "a": ["joules", "watts", "newtons", "metres"], "correct": 1, "why": "Power is measured in watts (W)."},
{"subject": "Science", "topic": "Electricity", "grade": 5, "type": "mcq", "q": "Resistance is calculated using:", "a": ["R=V/I", "R=VI", "R=I/V", "R=V+I"], "correct": 0, "why": "From V=IR, resistance R=V/I."},
{"subject": "Science", "topic": "Particle model", "grade": 5, "type": "mcq", "q": "Density equals:", "a": ["mass×volume", "mass÷volume", "volume÷mass", "force÷area"], "correct": 1, "why": "Density=mass/volume."},
{"subject": "Science", "topic": "Atomic physics", "grade": 5, "type": "mcq", "q": "Which radiation is most penetrating?", "a": ["alpha", "beta", "gamma", "all identical"], "correct": 2, "why": "Gamma is generally the most penetrating of the three."},
{"subject": "Science", "topic": "Forces", "grade": 5, "type": "mcq", "q": "Weight is calculated by:", "a": ["mass×gravitational field strength", "mass÷gravity", "force÷area", "distance÷time"], "correct": 0, "why": "Weight W=mg."},
{"subject": "Science", "topic": "Waves", "grade": 5, "type": "mcq", "q": "Frequency is measured in:", "a": ["metres", "seconds", "hertz", "newtons"], "correct": 2, "why": "Frequency is measured in hertz (Hz)."},
{"subject": "Science", "topic": "Magnetism", "grade": 5, "type": "mcq", "q": "Unlike magnetic poles:", "a": ["repel", "attract", "have no force", "disappear"], "correct": 1, "why": "Unlike poles attract; like poles repel."},
{"subject": "Science", "topic": "Electricity", "grade": 6, "type": "mcq", "q": "A 24 W device transfers 240 J. How long does it operate?", "a": ["5 s", "10 s", "24 s", "5760 s"], "correct": 1, "why": "P=E/t, so t=E/P=240/24=10 s."},
{"subject": "Science", "topic": "Forces", "grade": 6, "type": "mcq", "q": "Momentum equals:", "a": ["mass×velocity", "mass÷velocity", "force×area", "energy÷time"], "correct": 0, "why": "Momentum p=mv."},
{"subject": "Science", "topic": "Waves", "grade": 6, "type": "mcq", "q": "A wave has frequency 5 Hz and wavelength 3 m. Speed?", "a": ["1.67 m/s", "8 m/s", "15 m/s", "30 m/s"], "correct": 2, "why": "v=fλ=5×3=15 m/s."},
{"subject": "Science", "topic": "Chemistry calculations", "grade": 6, "type": "mcq", "q": "Mr of H₂O is 18. Mass of 2 moles?", "a": ["9 g", "18 g", "20 g", "36 g"], "correct": 3, "why": "Mass=moles×Mr=2×18=36 g."},
{"subject": "Science", "topic": "Genetics", "grade": 6, "type": "mcq", "q": "Meiosis produces cells with:", "a": ["full chromosome number only", "half the normal chromosome number", "no DNA", "double all chromosomes"], "correct": 1, "why": "Gametes produced by meiosis are haploid."},
{"subject": "Science", "topic": "Ecology", "grade": 6, "type": "mcq", "q": "Why are trophic-level biomass transfers inefficient?", "a": ["all biomass transfers", "energy is lost through respiration, movement and waste", "plants have no energy", "predators make energy"], "correct": 1, "why": "Not all biomass is consumed/absorbed, and energy is transferred to surroundings."},
{"subject": "English", "topic": "Retrieval", "grade": 4, "type": "mcq", "q": "Read: ‘Mina packed a torch, two bottles of water and a map.’ Which item is NOT mentioned?", "a": ["torch", "map", "water", "compass"], "correct": 3, "why": "A compass is not listed."},
{"subject": "English", "topic": "Vocabulary", "grade": 4, "type": "mcq", "q": "What does ‘weary’ most nearly mean?", "a": ["tired", "excited", "wealthy", "angry"], "correct": 0, "why": "Weary means tired, especially after effort."},
{"subject": "English", "topic": "Inference", "grade": 5, "type": "mcq", "q": "‘He folded the rejection letter carefully and placed it in his desk.’ What can reasonably be inferred?", "a": ["He cannot read", "The letter may matter to him despite disappointment", "He has won a prize", "He will burn it"], "correct": 1, "why": "Keeping it carefully can suggest significance despite rejection."},
{"subject": "English", "topic": "Language analysis", "grade": 5, "type": "mcq", "q": "‘Traffic crawled through the city.’ The verb ‘crawled’ suggests:", "a": ["very fast movement", "slow, difficult movement", "silence", "flight"], "correct": 1, "why": "‘Crawled’ implies frustratingly slow progress."},
{"subject": "English", "topic": "Structure", "grade": 5, "type": "mcq", "q": "Why might a writer end a paragraph with a one-word sentence: ‘Gone.’?", "a": ["To create emphasis", "To add statistics", "To introduce rhyme", "To make a list"], "correct": 0, "why": "The isolated word can create abrupt emphasis."},
{"subject": "English", "topic": "Comparison", "grade": 6, "type": "mcq", "q": "Text A presents technology as liberating; Text B presents it as intrusive. This is a difference in:", "a": ["spelling", "perspective", "font", "chronology only"], "correct": 1, "why": "The texts express contrasting viewpoints/perspectives."},
{"subject": "English", "topic": "Evaluation", "grade": 6, "type": "mcq", "q": "Which phrase begins a strong evaluation?", "a": ["The writer writes...", "This is effective because...", "There are words...", "I don't know..."], "correct": 1, "why": "Evaluation needs a judgement and justification."},
{"subject": "English", "topic": "Writing", "grade": 5, "type": "mcq", "q": "Which opening is most engaging for a story about a sudden disappearance?", "a": ["It was a day.", "At 8:17, every clock in the house stopped.", "I am writing a story.", "There was a person."], "correct": 1, "why": "It creates specificity, mystery and an immediate hook."},
{"subject": "English", "topic": "Writing", "grade": 6, "type": "mcq", "q": "Which sentence varies structure most effectively?", "a": ["I ran. I ran fast. I ran home.", "The gate slammed. Without looking back, I ran.", "I was running and running and running.", "Run was what I did."], "correct": 1, "why": "It combines a short sentence with a fronted phrase for pace and control."},
{"subject": "English", "topic": "Vocabulary", "grade": 7, "type": "mcq", "q": "‘Ambivalent’ most nearly means:", "a": ["having mixed feelings", "completely certain", "furious", "ancient"], "correct": 0, "why": "Ambivalent means having conflicting or mixed feelings."},
{"subject": "History", "topic": "Chronology", "grade": 4, "type": "mcq", "q": "Which comes first chronologically?", "a": ["1918", "1939", "1945", "1960"], "correct": 0, "why": "1918 is earliest."},
{"subject": "History", "topic": "Source utility", "grade": 5, "type": "mcq", "q": "A source can be useful even if biased because:", "a": ["bias makes it true", "it can reveal the creator's attitudes or purpose", "dates never matter", "all sources are equal"], "correct": 1, "why": "Bias itself can provide evidence about viewpoint, purpose or context."},
{"subject": "History", "topic": "Causation", "grade": 5, "type": "mcq", "q": "A long-term cause is one that:", "a": ["develops over an extended period", "happens after the event", "has no impact", "is always economic"], "correct": 0, "why": "Long-term causes develop over time."},
{"subject": "History", "topic": "Consequence", "grade": 5, "type": "mcq", "q": "A consequence is:", "a": ["a cause before an event", "a result or effect of an event", "a source author", "a date"], "correct": 1, "why": "Consequences are outcomes/effects."},
{"subject": "History", "topic": "Change and continuity", "grade": 6, "type": "mcq", "q": "A strong change-and-continuity answer should:", "a": ["only list dates", "identify what changed and what remained similar, with evidence", "ignore time", "only discuss one person"], "correct": 1, "why": "The concept requires both change and continuity across time."},
{"subject": "History", "topic": "Interpretations", "grade": 6, "type": "mcq", "q": "Two historians may reach different interpretations because they:", "a": ["must use different languages", "may select and weigh evidence differently", "cannot use evidence", "always disagree about dates"], "correct": 1, "why": "Interpretations can differ because historians select, emphasise and evaluate evidence differently."},
{"subject": "History", "topic": "Judgement", "grade": 7, "type": "mcq", "q": "Which best strengthens a judgement?", "a": ["more adjectives", "criteria such as scale, duration and impact", "a longer introduction only", "avoiding evidence"], "correct": 1, "why": "Explicit criteria make comparative judgements more defensible."}
];

let state=JSON.parse(localStorage.getItem("gcseBoostV08")||"null")||{
 version:"0.8",xp:0,streak:0,lives:3,completed:0,lastCompleted:null,skills:{},
 subjectLevel:{Maths:5,English:4,Science:5,History:4,RE:7},reviews:[],bossWins:0,
 tier:{Maths:"Foundation",Science:"Foundation"},bridgePasses:{Maths:0,Science:0},bridgeUnlocked:{Maths:false,Science:false},
 reading:{level:15,xp:0,completed:0,skills:{Retrieval:0,Inference:0,Vocabulary:0,Analysis:0,Evaluation:0,Writing:0}},
 history:[],weekly:{missions:0,correct:0,total:0},
 profile:{name:"",dailyGoal:10,onboarded:false,parentPin:"2468"},achievements:[]
};
let session=[],idx=0,correct=0,earned=0,answered=false,isBoss=false;
const $=x=>document.getElementById(x), today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem("gcseBoostV08",JSON.stringify(state))}
function show(id){["onboarding","home","quiz","complete","parent"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}
function diff(a,b){return Math.round((new Date(b)-new Date(a))/86400000)}
function key(q){return q.subject+" • "+q.topic}
function stat(q){return state.skills[key(q)]||{right:0,total:0,streak:0}}
function weakness(q){let s=stat(q);return s.total?1-s.right/s.total:.45}
function due(q){return state.reviews.includes(key(q))}
function updateStreak(){if(state.lastCompleted&&diff(state.lastCompleted,today())>1)state.streak=0}
function nextSubject(){return ["Maths","English","Science","English","Maths","Science","History"][state.completed%7]}
function buildDaily(){
 let sub=nextSubject(), lvl=state.subjectLevel[sub];
 if(sub==="English" && state.reading){
   lvl=Math.max(4,Math.min(7,state.subjectLevel.English));
 }
 let maxGrade=(["Maths","Science"].includes(sub)&&state.tier[sub]==="Foundation")?5:7;
 let pool=BANK.filter(q=>q.subject===sub&&q.grade>=Math.max(4,lvl-1)&&q.grade<=Math.min(maxGrade,lvl+1));
 pool.sort((a,b)=>(due(b)-due(a))+(weakness(b)-weakness(a))+(Math.random()-.5)*.2);
 let picks=pool.slice(0,6);
 let retrieval=BANK.filter(q=>!picks.includes(q)&&due(q)).sort(()=>Math.random()-.5).slice(0,2);
 picks=picks.concat(retrieval);
 let fillers=BANK.filter(q=>!picks.includes(q)&&["Maths","English","Science"].includes(q.subject)).sort(()=>Math.random()-.5);
 return picks.concat(fillers).slice(0,8);
}

function buildBridge(subject){
 let base=BANK.filter(q=>q.subject===subject && q.grade>=4 && q.grade<=6);
 base.sort((a,b)=>(due(b)-due(a))+(weakness(b)-weakness(a))+(Math.random()-.5)*.25);
 let out=[],i=0;
 while(out.length<30 && base.length){
   let q=base[i%base.length];
   out.push({...q,id:`bridge-${out.length}-${q.topic}`});
   i++;
 }
 return out;
}
function buildBoss(){
 let all=[...BANK].sort((a,b)=>(weakness(b)+due(b)*.4)-(weakness(a)+due(a)*.4)+(Math.random()-.5)*.2);
 return all.filter(q=>q.grade>=5).slice(0,10);
}

function unlock(id){
 state.achievements=state.achievements||[];
 if(!state.achievements.includes(id)){state.achievements.push(id);return true}return false
}
const BADGES=[
 ["first","🚀","First Mission"],["streak3","🔥","3 Day Streak"],["xp500","⭐","500 XP"],
 ["foundation","🧱","Foundation Strong"],["mathHigher","🧮","Maths Higher"],["scienceHigher","🧪","Science Higher"],
 ["boss","👑","Boss Winner"],["english","📚","English Climber"]
];
function checkAchievements(){
 let fresh=[];
 if(state.completed>=1&&unlock("first"))fresh.push("First Mission");
 if(state.streak>=3&&unlock("streak3"))fresh.push("3 Day Streak");
 if(state.xp>=500&&unlock("xp500"))fresh.push("500 XP");
 if(state.subjectLevel.Maths>=5&&state.subjectLevel.Science>=5&&unlock("foundation"))fresh.push("Foundation Strong");
 if(state.tier.Maths==="Higher"&&unlock("mathHigher"))fresh.push("Maths Higher");
 if(state.tier.Science==="Higher"&&unlock("scienceHigher"))fresh.push("Science Higher");
 if(state.bossWins>=1&&unlock("boss"))fresh.push("Boss Winner");
 if(state.subjectLevel.English>=5&&unlock("english"))fresh.push("English Climber");
 return fresh;
}
function journeyHTML(){
 let higher=(state.tier.Maths==="Higher"||state.tier.Science==="Higher");
 let g6=Math.max(state.subjectLevel.Maths,state.subjectLevel.Science,state.subjectLevel.English)>=6;
 let g7=Math.max(state.subjectLevel.Maths,state.subjectLevel.Science,state.subjectLevel.English)>=7;
 let nodes=[["Foundation",true],["Grade 5",state.subjectLevel.Maths>=5],["Higher",higher],["Grade 6",g6],["Grade 7",g7]];
 let current=nodes.findIndex(x=>!x[1]); if(current<0)current=nodes.length-1;
 return '<div class="journey">'+nodes.map((n,i)=>`${i?'<div class="connector"></div>':''}<div class="node ${n[1]?'done':''} ${i===current?'now':''}">${n[1]?'✓ ':''}${n[0]}</div>`).join("")+'</div>';
}
function badgesHTML(){
 return '<div class="badges">'+BADGES.map(([id,e,n])=>`<div class="badge ${state.achievements?.includes(id)?'':'locked'}"><strong>${e}</strong>${n}</div>`).join("")+'</div>';
}
function renderHome(){
 updateStreak();checkAchievements();$("xp").textContent=state.xp;$("streak").textContent=state.streak;$("lives").textContent=3;
 let s=nextSubject();$("missionTitle").textContent=s+" Boost";let tier=(["Maths","Science"].includes(s)?state.tier[s]:"GCSE");
 $("missionSub").textContent=`${tier} • working level ${state.subjectLevel[s]} • about 10 minutes`;
 $("homeBar").style.width=((state.completed%5)/5*100)+"%";
 $("journeyMap").innerHTML=journeyHTML();
 $("achievementsHome").innerHTML=badgesHTML();
 let subs=[["🧮","Maths"],["📖","English"],["🧪","Science"],["🏰","History"],["✝️","RE"]];
 $("subjects").innerHTML=subs.map(([e,n])=>`<div class="subject"><div><b>${e} ${n}</b><small>${n==="RE"?"Maintenance":`Working level ${state.subjectLevel[n]}`}</small></div><span class="pill">${n==="RE"?"7 ✓":"ACTIVE"}</span></div>`).join("");save()
}
let bridgeSubject=null;
function start(boss=false,bridge=null){
 isBoss=boss;bridgeSubject=bridge;state.lives=3;
 session=bridge?buildBridge(bridge):(boss?buildBoss():buildDaily());
 idx=0;correct=0;earned=0;show("quiz");renderQ()
}
function renderQ(){
 answered=false;let q=session[idx];$("feedback").classList.add("hidden");$("nextBtn").classList.add("hidden");
 $("qMeta").textContent=`${bridgeSubject?"TIER TEST • ":isBoss?"BOSS • ":""}${q.subject.toUpperCase()} • ${q.topic} • GRADE ${q.grade}`;
 $("question").textContent=q.q;$("quizBar").style.width=(idx/session.length*100)+"%";$("quizLives").textContent="❤️".repeat(state.lives)+"♡".repeat(3-state.lives);
 $("answers").classList.toggle("hidden",q.type!=="mcq");$("typedWrap").classList.toggle("hidden",q.type==="mcq");
 if(q.type==="mcq"){
  $("answers").innerHTML=q.a.map((x,i)=>`<button class="answer" data-i="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join("");
  document.querySelectorAll(".answer").forEach(b=>b.onclick=()=>markMCQ(+b.dataset.i,b));
 } else {$("typedAnswer").value="";$("typedAnswer").placeholder=q.type==="typed_text"?"Write your short answer...":"Type your answer..."}
}
function updateSkill(q,ok){
 let k=key(q);state.skills[k]??={right:0,total:0,streak:0,last:null};let s=state.skills[k];s.total++;s.last=today();
 if(ok){s.right++;s.streak++; if(s.streak>=2)state.reviews=state.reviews.filter(x=>x!==k)}
 else{s.streak=0;if(!state.reviews.includes(k))state.reviews.push(k)}
 if(q.subject==="English"&&state.reading){
   let cat=/retrieval|summary/i.test(q.topic)?"Retrieval":/infer|implicit|evidence/i.test(q.topic)?"Inference":/vocabulary|meaning/i.test(q.topic)?"Vocabulary":/analysis|language|structure|comparison/i.test(q.topic)?"Analysis":/evaluat/i.test(q.topic)?"Evaluation":"Writing";
   state.reading.skills[cat]=(state.reading.skills[cat]||0)+(ok?2:0);
 }
}
function feedback(q,ok){
 state.history=state.history||[];state.weekly=state.weekly||{missions:0,correct:0,total:0};
 state.history.push({date:today(),subject:q.subject,topic:q.topic,grade:q.grade,ok});
 if(state.history.length>500)state.history=state.history.slice(-500);
 state.weekly.total++;if(ok)state.weekly.correct++;
 if(ok){correct++;let pts=q.grade>=7?20:10;earned+=pts;$("feedback").innerHTML=`<b>Correct! +${pts} XP ⭐</b><br>${q.why}`}
 else{state.lives=Math.max(0,state.lives-1);$("feedback").innerHTML=`<b>Good attempt — this goes into recovery practice.</b><br>${q.why}`}
 $("quizLives").textContent="❤️".repeat(state.lives)+"♡".repeat(3-state.lives);$("feedback").classList.remove("hidden");$("nextBtn").classList.remove("hidden");save()
}
function markMCQ(c,b){if(answered)return;answered=true;let q=session[idx],ok=c===q.correct;document.querySelectorAll(".answer")[q.correct].classList.add("correct");if(!ok)b.classList.add("wrong");updateSkill(q,ok);feedback(q,ok)}
function norm(x){return x.toLowerCase().replace(/[^\w.%'-]/g," ").replace(/\s+/g," ").trim()}
function markTyped(){
 if(answered)return;let q=session[idx],v=norm($("typedAnswer").value);if(!v)return;
 answered=true;let ok=false;
 if(q.type==="typed") ok=v===norm(q.answer)||v.startsWith(norm(q.answer)+" ");
 else {let hits=q.keywords.filter(k=>v.includes(k)).length;ok=hits>=1 && v.split(" ").length>=6}
 updateSkill(q,ok);feedback(q,ok)
}
function recalc(){
 for(let sub of ["Maths","English","Science","History"]){
  let rows=Object.entries(state.skills).filter(([k])=>k.startsWith(sub+" • ")).map(x=>x[1]);
  if(rows.length<2)continue;let t=rows.reduce((a,s)=>a+s.total,0),r=rows.reduce((a,s)=>a+s.right,0),acc=r/t,l=state.subjectLevel[sub];
  if(t>=6&&acc>=.78){
    let cap=(["Maths","Science"].includes(sub)&&state.tier[sub]==="Foundation")?5:7;
    state.subjectLevel[sub]=Math.min(cap,l+1);
    if(["Maths","Science"].includes(sub)&&state.tier[sub]==="Foundation"&&state.subjectLevel[sub]>=5&&acc>=.75&&t>=12)state.bridgeUnlocked[sub]=true;
  } else if(t>=6&&acc<.38) state.subjectLevel[sub]=Math.max(4,l-1)
 }
}
function finish(){
 earned+=(isBoss||bridgeSubject)?100:50;state.xp+=earned;recalc();
 if(bridgeSubject){
   let rate=correct/session.length;
   state.lastBridge=state.lastBridge||{};
   state.lastBridge[bridgeSubject]={score:Math.round(rate*100),date:today()};
   if(rate>=.80){
     state.bridgePasses[bridgeSubject]=(state.bridgePasses[bridgeSubject]||0)+1;
     state.tier[bridgeSubject]="Higher";
     state.subjectLevel[bridgeSubject]=Math.max(5,state.subjectLevel[bridgeSubject]);
     state.bridgeUnlocked[bridgeSubject]=false;
   }
 }
 if(!isBoss&&!bridgeSubject){state.completed++;state.weekly.missions++;if(state.lastCompleted!==today()){state.streak=(!state.lastCompleted||diff(state.lastCompleted,today())===1)?state.streak+1:1;state.lastCompleted=today()}}
 else if(isBoss&&correct/session.length>=.7)state.bossWins++;
 let fresh=checkAchievements();state.lives=3;save();
 $("resultBadges").innerHTML=fresh.length?`<div class="card"><b>Achievement unlocked!</b><br>${fresh.map(x=>"🏆 "+x).join("<br>")}</div>`:"";
 $("scoreLine").textContent=`${correct}/${session.length} correct • ${Math.round(correct/session.length*100)}% accuracy`;
 $("earnedXP").textContent=`⭐ +${earned} XP`;
 let weak=Object.entries(state.skills).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total))[0];
 $("weakness").textContent=weak?`Recovery focus: ${weak[0]}`:"Great work.";show("complete")
}
function next(){idx++;idx<session.length?renderQ():finish()}
function parent(){
 if(!sessionStorage.getItem("gcseParentUnlocked")){
   show("parent");$("pinGate").classList.remove("hidden");$("parentContent").classList.add("hidden");return;
 }
 $("pinGate").classList.add("hidden");$("parentContent").classList.remove("hidden");
 let m=state.tier.Maths,s=state.tier.Science;
 function readinessFor(sub){
   let entries=Object.entries(state.skills).filter(([k])=>k.startsWith(sub+" • "));
   let t=entries.reduce((a,[,v])=>a+v.total,0),r=entries.reduce((a,[,v])=>a+v.right,0);
   return t?Math.round(r/t*100):0;
 }
 let mr=readinessFor("Maths"),sr=readinessFor("Science");
 let rs=state.reading||{level:15,skills:{}};
 let rskills=Object.entries(rs.skills||{});
 let ravg=rskills.length?Math.round(rskills.reduce((a,[,v])=>a+v,0)/rskills.length):0;
 let subjects=["Maths","English","Science","History"];
 $("coveragePanel").innerHTML='<div class="covergrid">'+subjects.map(sub=>{
   let qs=BANK.filter(q=>q.subject===sub),topics=new Set(qs.map(q=>q.topic)).size;
   let answered=(state.history||[]).filter(h=>h.subject===sub).length;
   return `<div class="coveritem"><b>${sub}</b><span class="tiny">${qs.length} questions • ${topics} topics<br>${answered} attempts</span></div>`;
 }).join("")+'</div>';
 let wh=(state.history||[]).filter(h=>Date.now()-new Date(h.date).getTime()<7*86400000);
 let wc=wh.filter(h=>h.ok).length,wa=wh.length?Math.round(wc/wh.length*100):0;
 let weakTopics=Object.entries(state.skills).filter(([,v])=>v.total>=1).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total)).slice(0,3);
 $("weeklyPanel").innerHTML=`<div class="weekscore">${wa}%</div><b>7-day accuracy</b><p>${wh.length} questions attempted in the last 7 days.</p>${weakTopics.length?'<b>Priority recovery</b><br>'+weakTopics.map(([k])=>'• '+k).join('<br>'):'Complete some missions to build the report.'}`;
 $("readingPanel").innerHTML=`
   <div class="reading-card"><b>Reading pathway</b><div class="levelchips"><span>Age 15 start</span><span>GCSE Grade 4</span><span>Grade 5</span><span>Grade 6</span><span>Grade 7 target</span></div>
   <p>English is weighted twice in each 7-session cycle. The engine practises retrieval, inference, vocabulary in context, language/structure analysis, evaluation and writing accuracy.</p></div>
   ${rskills.map(([k,v])=>`<div class="traffic"><span>${k}</span><b>${Math.min(100,v)} pts</b></div>`).join("")}
   <p class="note">Reading age is treated as a starting accessibility setting, not a diagnosis. Progress is driven by GCSE skill mastery and increasingly demanding texts.</p>`;
 $("readiness").innerHTML=`
   <b>Maths readiness ${mr}%</b><div class="meter"><i style="width:${mr}%"></i></div>
   <b>Science readiness ${sr}%</b><div class="meter"><i style="width:${sr}%"></i></div>
   <p class="note">The app unlocks the readiness assessment after enough secure Foundation Grade 5 practice. The 30-question assessment requires 80% in this learning programme. It is a practice milestone, not the school's tier-entry decision.</p>
   ${state.lastBridge?Object.entries(state.lastBridge).map(([k,v])=>`<div class="traffic"><span>Last ${k} tier test</span><b>${v.score}%</b></div>`).join(""):""}
   ${(m==="Higher"||s==="Higher")?`<div class="cert">🏆 <b>Higher Pathway Achievement</b><br>${m==="Higher"?"Maths Higher unlocked<br>":""}${s==="Higher"?"Science Higher unlocked":""}</div>`:""}`;
 $("tierPath").innerHTML=`
 <div class="path"><div class="stage ${m==="Foundation"?"active":""}"><b>Maths Foundation</b><br>Grades 1–5</div><div class="arrow">→</div><div class="stage ${m==="Higher"?"active":"locked"}"><b>Maths Higher</b><br>Grades 4–9</div></div>
 <div class="testbox">${m==="Higher"?"✅ Maths Higher pathway unlocked":state.bridgeUnlocked.Maths?'<button class="primary" id="mathBridge">TAKE MATHS HIGHER READINESS TEST</button>':"Maths readiness test unlocks after secure Grade 5 performance."}</div>
 <br><div class="path"><div class="stage ${s==="Foundation"?"active":""}"><b>Science Foundation</b><br>Up to 5–5</div><div class="arrow">→</div><div class="stage ${s==="Higher"?"active":"locked"}"><b>Science Higher</b><br>Up to 9–9</div></div>
 <div class="testbox">${s==="Higher"?"✅ Science Higher pathway unlocked":state.bridgeUnlocked.Science?'<button class="primary" id="scienceBridge">TAKE SCIENCE HIGHER READINESS TEST</button>':"Science readiness test unlocks after secure Foundation performance."}</div>`;
 setTimeout(()=>{
   let mb=$("mathBridge"),sb=$("scienceBridge");
   if(mb)mb.onclick=()=>start(false,"Maths");
   if(sb)sb.onclick=()=>start(false,"Science");
 },0);

 let vals=Object.values(state.skills),t=vals.reduce((a,x)=>a+x.total,0),r=vals.reduce((a,x)=>a+x.right,0);
 $("parentSummary").innerHTML=`Missions: <b>${state.completed}</b><br>Streak: <b>${state.streak} days</b><br>XP: <b>${state.xp}</b><br>Accuracy: <b>${t?Math.round(r/t*100):0}%</b><br>Recovery skills queued: <b>${state.reviews.length}</b><br>Boss wins: <b>${state.bossWins}</b><br>Maths tier: <b>${state.tier.Maths}</b><br>Science tier: <b>${state.tier.Science}</b><br><br><b>Working levels</b><br>Maths ${state.subjectLevel.Maths} • English ${state.subjectLevel.English} • Science ${state.subjectLevel.Science} • History ${state.subjectLevel.History} • RE 7`;
 let e=Object.entries(state.skills).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total));
 $("skills").innerHTML=e.length?e.slice(0,12).map(([k,v])=>`<div class="skillrow"><span>${k}</span><b>${Math.round(v.right/v.total*100)}%</b></div>`).join(""):"Complete a mission first.";
 $("bossBtn").disabled=state.completed<5; $("bossBtn").textContent=state.completed<5?`BOSS BATTLE — ${5-state.completed} MISSIONS TO UNLOCK`:"START BOSS BATTLE";show("parent")
}

let chosenGoal=10;
document.querySelectorAll(".goalpick button").forEach(b=>b.onclick=()=>{
 chosenGoal=+b.dataset.goal;document.querySelectorAll(".goalpick button").forEach(x=>x.classList.toggle("selected",x===b));
});
$("beginSetup").onclick=()=>{
 let name=$("learnerName").value.trim(); if(!name)return;
 state.profile={...(state.profile||{}),name,dailyGoal:chosenGoal,onboarded:true,parentPin:(state.profile?.parentPin||"2468")};save();show("home");renderHome();
};
$("pinSubmit").onclick=()=>{
 let pin=$("pinInput").value;
 if(pin===(state.profile?.parentPin||"2468")){sessionStorage.setItem("gcseParentUnlocked","1");$("pinGate").classList.add("hidden");$("parentContent").classList.remove("hidden");parent()}
 else $("pinMsg").textContent="Incorrect PIN.";
};
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").classList.add("hidden")}};

$("startBtn").onclick=()=>start(false,null);$("submitTyped").onclick=markTyped;$("nextBtn").onclick=next;
$("quitBtn").onclick=()=>{save();show("home");renderHome()};$("doneBtn").onclick=()=>{show("home");renderHome()};
$("parentBtn").onclick=parent;$("parentBack").onclick=()=>{show("home");renderHome()};$("bossBtn").onclick=()=>{if(state.completed>=5)start(true,null)};
$("resetBtn").onclick=()=>{if(confirm("Reset GCSE Boost V0.3 progress?")){localStorage.removeItem("gcseBoostV08");location.reload()}};
if(!state.profile?.onboarded){show("onboarding")}else{show("home");renderHome()}
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
