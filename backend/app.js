/* eslint-disable radix */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
require('./config/mongoose-connection');
const cookieParser = require('cookie-parser');
const usermongo = require('./mongoose/Usermongo');
const challenge = require('./mongoose/Challengemongo');
const Shortmongo = require('./mongoose/ShortChallenge');
const Assignedmongo = require('./mongoose/Assignedmongo');
const Proofmongo = require('./mongoose/UserProof');
const Shopmongo = require('./mongoose/Shop');
const isloggedin = require('./middleware/isloggedin');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');


app.post('/Register',async (req, res) => {
    const { username, email, Mobile, password } = req.body;
    console.log(req.body);

    const user = new usermongo({
        username,
        email,
        Mobile,
        password,
    });

    await user.save();

    const token = jwt.sign({ email, id: user._id }, 'ewyfif8787347ry378', {
        expiresIn: '7d',
    });

    res.cookie('username', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
    });
    console.log(token);

    res.json({
        success: true,
        message: 'Registration successful',
        user: {
            username: user.username,
            email: user.email,
            Mobile: user.Mobile,
        },
        token,
    });
});

app.get('/validate-token', isloggedin, (req, res) => {
    res.status(200).json({ valid: true });
});

app.get('/Stats',isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email });

    const Stack = user.ActiveChallenge.Payment;
    const StartDate = user.ActiveChallenge.StartDate;
    const EndDate = user.ActiveChallenge.EndDate;

    res.status(200).json({ Stack, StartDate, EndDate });
});

app.get('/ShortChallenge', async (req, res) => {
    const challenge = await Shortmongo.find();

    res.status(200).json(challenge);
});

app.post('/ShortChallenge',isloggedin, async (req, res) => {
    const { challenge } = req.body;
    const user = await usermongo.findOne({ email: req.user.email });

    const startDate = new Date();
    const periodDays = parseInt(challenge.period);
    const endDate = new Date(startDate.getTime() + periodDays * 24 * 60 * 60 * 1000);

    user.ShortActiveChallenge.push({
        challengeId: challenge.id,
        startDate,
        endDate,
        CompleteRate: 0,
        ChallengeStatus: 'Active',
    });
    await user.save();

    res.status(200).json({ success: true });
});

app.get('/UserShortChallenge/:challengeId', isloggedin, async (req, res) => {

    const { challengeId } = req.params;
    const user = await usermongo.findOne({ email: req.user.email }).populate('ShortActiveChallenge');

    if (user.ShortActiveChallenge.length === 0) {
        return res.status(404).json({ error: 'No active challenge found.' });
      }

    const isInChallenge = user.ShortActiveChallenge.some(entry =>
        entry.challengeId && entry.challengeId._id.toString() === challengeId
      );

      const startDate = user.ShortActiveChallenge[0].startDate;
      const EndDate = user.ShortActiveChallenge[0].endDate;

      const currentDate = new Date();
      const totalDuration = new Date(EndDate) - new Date(startDate);
      const elapsedDuration = currentDate - new Date(startDate);

      let progress = (elapsedDuration / totalDuration) * 100;
    progress = Math.min(Math.max(progress, 0), 100);

      console.log(progress.toFixed(2));

    //   console.log(user.ShortActiveChallenge);

    res.status(200).json({
        isInChallenge,
        progress: progress.toFixed(2),
      });
});

app.get('/UserActiveShortChallenge',isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email }).populate({
        path: 'ShortActiveChallenge.challengeId',
        select: ' ChallengeName ChallengeDes ChallengeEndDate ChallengeReward ChallengeDifficulty ChallengeCategory ChallengePeriod Proof Instruction BigDescription',
    });

    if (!user || !user.ShortActiveChallenge || user.ShortActiveChallenge.length === 0) {
        return res.status(404).json({ ShortActiveChallenge: [], progress: [], DaysCompleted: [] });
    }


    const activeChallenges = user.ShortActiveChallenge.filter(challenge => challenge.ChallengeStatus === 'Active');

    const Prog = user.ShortActiveChallenge.map(challenge => challenge.CompleteRate); 

    if (activeChallenges.length === 0) {
        return res.status(404).json({ ShortActiveChallenge: [], progress: [], DaysCompleted: [] });
    }

      const startDate = user.ShortActiveChallenge[0].startDate;
      const EndDate = user.ShortActiveChallenge[0].endDate;

     let progress;


    if(Prog){
      progress = Prog;
    }else{
      progress = 0;
    }

        const today = new Date();
        const totalDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        const DaysCompleted = Math.ceil((EndDate - startDate) / (1000 * 60 * 60 * 24));

        const daysInProgress = Math.min(DaysCompleted, totalDays);
        console.log(progress);


    res.status(200).json({ ShortActiveChallenge: activeChallenges, progress, daysInProgress });
});

app.get('/', isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email });

    const ChallengeExist  = user.ActiveChallenge && Object.values(user.ActiveChallenge).some(val => typeof val === 'string' && val.trim() !== '');
    const AssignedPresentChallenge = user.AssignedPresentChallenge && Object.values(user.AssignedPresentChallenge).some(val => typeof val === 'string' && val.trim() !== '');
    const AssignedChallenge = user.AssignedChallenges.length > 0;
    const SelfChallenge = typeof user.SelfChallenge === 'object' && user.SelfChallenge !== null;
    const StartDate = user.ActiveChallenge?.StartDate;
    const EndDate = user.ActiveChallenge?.EndDate;

    const SkipDate = user.ActiveChallenge?.skipDate;
    const SkipEndDate = user.ActiveChallenge?.SkipEndDate;

    let skipornot = false;

    if (SkipDate && SkipEndDate) {
        const currentTime = new Date();
        const skipDate = new Date(SkipDate);
        const skipEndDate = new Date(SkipEndDate);

        // If the current time is between skipDate and SkipEndDate, set skipornot to true
        if (currentTime >= skipDate && currentTime <= skipEndDate) {
            skipornot = true;
        }
    }

    res.json({
        ChallengeExist,
        AssignedPresentChallenge,
        AssignedChallenge,
        SelfChallenge,
        skipornot,
        SkipEndDate,
        StartDate,
        EndDate,
    });
});

app.get('/Shame-Feed', (req, res) => {
    res.render('Shame', { currentUrl: req.originalUrl });
});

app.get('/Elite', (req, res) => {
    res.render('Elite', { currentUrl: req.originalUrl });
});

app.get('/Challenge', isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email });

    if (user.SelfChallenge) {
        return res.status(200).json({ redirect: `/Automated-Challenge/${user._id}` });
    } else {
        return res.status(200).json({ user }); // Send user data to React Native
    }
});

app.post('/personalized-Challenge', isloggedin, upload.single('photo'), async (req, res) => {
    const { challengeName, challengeType, timelineValue, weightValue, weightType, transformationValue, consistency, gender, CurrentWeight, DifficultyLevel, BMI, height } = req.body;

    const getSubType = (...values) => {
        const subType = values.find(val => val && val.trim() !== '');
        return subType || challengeType; // Fallback to ChallengeType if subType is not found
    };

    const challenges = new challenge({
      ChallengeName: challengeName,
      ChallengeType: challengeType,
      ChallengeSubType: getSubType(weightType, transformationValue, consistency),
      Gender: gender,
      Duration: timelineValue,
      Status: 'Self Alloted',
      CurrentWeight,
      TargetWeight: weightValue,
      DifficultyLevel: DifficultyLevel,
      Height: height,
      BMI: BMI,
    });


    const user = await usermongo.findOne({ email: req.user.email });
    user.Photo = req.file;
    user.CurrentWeight = CurrentWeight;
    user.SelfChallenge = challenges;

    await user.save();
    challenges.save();

    res.json({
        success: true,
        message: 'Challenge created successfully',
    });
});

app.get('/Automated-Challenge', isloggedin, async (req, res) => {
    let goal = [];

    const user = await usermongo.findOne({ email: req.user.email }).populate({
        path: 'SelfChallenge',
        select: 'ChallengeName ChallengeType ChallengeSubType Gender Duration Status CurrentWeight TargetWeight Height DifficultyLevel',
    }).populate({
        path: 'AssignedChallenges',
        select: 'AssignedChallenge AssignedChallengeDescription AssignedChallengeDuration AssignedforUser AssignedChallengeDifficulty AssignedChallengeCompletionRate AssignedChallengeParticipants AssignedProof AssignedInstruction',
    }).populate('AssignedPresentChallenge');

    if (user.AssignedChallenges && user.AssignedChallenges.length > 0) {
        // eslint-disable-next-line no-shadow
        const challenge = user.AssignedPresentChallenge;

        if (challenge && Object.values(challenge).some(val => typeof val === 'string' && val.trim() !== '')) {
            return res.redirect('/challenge-confirmation-page');
        }

        const titles = user.AssignedChallenges[0].AssignedChallenge; // e.g., ['NoFap', 'HIIT', 'Karela Juice']
        const descriptions = user.AssignedChallenges[0].AssignedChallengeDescription; // already an array
        const durations = user.AssignedChallenges[0].AssignedChallengeDuration; // already an array
        const completionRates = user.AssignedChallenges[0].AssignedChallengeCompletionRate; // already an array
        const participants = user.AssignedChallenges[0].AssignedChallengeParticipants; // already an array
        const difficulties = user.AssignedChallenges[0].AssignedChallengeDifficulty; // already an array
        const Proof = user.AssignedChallenges[0].AssignedProof;
        const Instruction = user.AssignedChallenges[0].AssignedInstruction;

        const challenges = titles.map((title, i) => ({
            goal: title,
            description: descriptions[i] || '',
            duration: durations[i] || '',
            completionRate: completionRates[i] || '',
            participants: participants[i] || '',
            difficulty: difficulties[i] || '',
            Proof: Proof[i] || '',
            Instruction: Instruction[i] || '',
        }));

        const Type = user.SelfChallenge.ChallengeType;

        return res.status(200).json({ challenges, Type, user });
    }

    const ChallengeExist = user.SelfChallenge.ChallengeSubType;
    const ChallengeTimeline = String(user.SelfChallenge.Duration); // Ensure string type
    const currentWeight = Number(user.CurrentWeight);
    const heightCm = user.SelfChallenge.Height;

    // Calculate BMI: weight (kg) / (height (m))^2
    const heightM = heightCm / 100;
    const bmi = currentWeight / (heightM * heightM);

    function extractDuration(challengeText) {
        const durationRegex = /(\d+)\s*(Days?|Months?)/i;
        const match = challengeText.match(durationRegex);
        return match ? parseInt(match[1]) : null;
    }

    // eslint-disable-next-line no-shadow
    function assignUserChallenges(challengeSubType, timeline, bmi, heightCm, currentWeight) {
        // Normalize challengeSubType
        const normalizedSubType = challengeSubType.toLowerCase();

        // Define all goals based on timeline and challengeSubType
        const goalsByTimelineAndSubType = {
                '3': {
                  athlete: [
                    {
                      'title': 'Wake up at 4:00 AM',
                      'description': 'Build discipline by starting your day early. It gives you extra hours for training, planning, and self-growth without distractions.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Video',
                      'Instruction': 'Wake Up before 4 and do 3 sets of Jumping Squats with video Proof',
                    },
                    {
                      'title': 'Reduce Phone Time To 2 hours',
                      'description': 'Limit distractions and reclaim time for meaningful activities like workouts, reading, and recovery. Helps sharpen focus.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Permission',
                      'Instruction': 'Allow Access to Mobile usage Tracker',
                    },
                    {
                      'title': 'Do Surya Namaskar regularly for 90 Days, No Rest Days',
                      'description': 'Enhance flexibility, strength, and mindfulness through this ancient yoga practice. Doing it daily builds mental and physical endurance.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Do 3 sets of Surya Namaskar with video Proof (No Edit)',
                    },
                    {
                      'title': 'Run 10 km daily for 60 days',
                      'description': 'Boost stamina, mental toughness, and cardiovascular health. Running daily for 60 days develops iron discipline and consistency.',
                      'completionRate': 55,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Video Permission',
                      'Instruction': 'Allow access to Fitness Tracker & submit the 2 minute video proof of start and end',
                    },
                    {
                      'title': 'Get 6 Pack Abs within 90 Days',
                      'description': 'Achieve peak aesthetics and core strength through intense training and clean eating. This is a symbol of your fitness dedication.',
                      'completionRate': 50,
                      'difficulty': 'Extreme',
                      'participants': 700,
                      'Proof': 'Photo',
                      'Instruction': 'Upload a Daily Photo of Abs (Front/Side)',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 90 Days',
                      'description': 'Push beyond your comfort zone with a new physical or mental challenge each week. Keeps growth dynamic and avoids plateau.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  weightgain: [
                    {
                      'title': 'Follow A Strict Weight Gaining Diet',
                      'description': 'Stick to a well-planned high-calorie diet rich in proteins, carbs, and healthy fats to build muscle and gain weight effectively.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 900,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'WAKE UP AT 4:00 AM',
                      'description': 'Gain a head start on the day. Waking early allows time for meal prep, workouts, and a focused mindset toward your goals.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Wake Up before 4 and do 3 sets of Jumping Squats with video Proof',
                    },
                    {
                      'title': 'Phone Off at 8:00 PM Every Day For 60 Days',
                      'description': 'Reduce screen time to improve sleep quality and boost recovery. Helps in maintaining a consistent routine and mental clarity.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 950,
                      'Proof': 'Permission',
                      'Instruction': 'Allow Access to Mobile usage Tracker',
                    },
                    {
                      'title': 'Run 4 km daily for 60 days (No Off Day)',
                      'description': 'Keep metabolism active and stimulate appetite. Light cardio builds endurance without compromising muscle gain.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 850,
                      'Proof': 'Video Permission',
                      'Instruction': 'Allow access to Fitness Tracker & submit the 2 minute video proof of start and end',
                    },
                    {
                      'title': 'Intake 3,200–3,500 kcal per day',
                      'description': 'Consume more calories than you burn. This is essential to ensure your body has the fuel it needs to build size and strength.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Drink 2 High-Calorie Shakes Daily',
                      'description': 'Easily increase daily calorie intake with nutrient-dense shakes. Great for busy days and when you struggle to eat large meals.',
                      'completionRate': 80,
                      'difficulty': 'Easy',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Make Video of Making Shake and Drinking it',
                    },
                    {
                      'title': 'Eat Every 3 Hours (Even When Not Hungry)',
                      'description': 'Train your body to accept more food. Frequent meals prevent catabolism and ensure continuous energy and nutrient supply.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 750,
                      'Proof': 'Video',
                      'Instruction': 'Upload Video of Eating the Food',
                    },
                    {
                      'title': 'Gain 4 Kg in 30 Days',
                      'description': 'A bold target to ignite your determination. Even if you fall short, the progress will be massive if you stay consistent.',
                      'completionRate': 45,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo Weight EveryDay',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 75 Days',
                      'description': 'Stick to a complete and structured plan that ensures nutritional balance, variety, and sustainability for long-term gains.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 850,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 90 Days',
                      'description': 'Stay motivated with new fitness or mindset challenges every week. Keeps the journey exciting and continuously progressive.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  weightloss: [
                    {
                      'title': 'Follow A Strict Diet',
                      'description': 'Stick to a calorie-deficit, nutrient-dense meal plan that promotes fat loss while maintaining energy and focus.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Run 10 km Daily for 60 Days',
                      'description': 'Supercharge your metabolism and burn fat fast with consistent high-volume cardio. Builds stamina and mental toughness.',
                      'completionRate': 55,
                      'difficulty': 'Extreme',
                      'participants': 700,
                      'Proof': 'Video Permission',
                      'Instruction': 'Allow access to Fitness Tracker & submit the 2 minute video proof of start and end',
                    },
                    {
                      'title': 'Burn or Cut 1,200 kcal/day',
                      'description': 'Maintain a daily caloric deficit through diet and exercise to accelerate fat loss. Requires precision and discipline.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Photo Permission',
                      'Instruction': 'Upload food photos + fitness tracker screenshot of calories burned',
                    },
                    {
                      'title': 'Start With 10 Burpees on Day 1 and Reach 100 Burpees By Day 60',
                      'description': 'Build explosive strength and burn calories fast with progressive burpee challenges. Watch your endurance skyrocket.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record full set of burpees daily',
                    },
                    {
                      'title': 'Reduce 8 Kg Weight in 50 Days (Not For Beginners)',
                      'description': 'An advanced fat-loss goal demanding high discipline in diet and workouts. For those ready to break limits.',
                      'completionRate': 50,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Photo',
                      'Instruction': 'Upload daily weigh-in photo with scale visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 60 Days for 30 MIN',
                      'description': 'High-Intensity Interval Training melts fat quickly while preserving muscle. Boosts metabolism even after the workout.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km Daily for 60 Days',
                      'description': 'Own your mornings. Early runs build routine, increase fat burn, and reinforce a high-performance mindset.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof',
                    },
                    {
                      'title': 'Do Both Indoor & Outdoor Workout Every Day For 60 Days, Only One Rest Day per Week',
                      'description': 'Combine strength, flexibility, and cardio training to attack fat from all angles. Stay versatile and consistent.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type daily',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 75 Days',
                      'description': 'Stick to a fully structured plan that makes healthy eating simple and consistent, removing decision fatigue.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 90 Days',
                      'description': 'Stay driven with weekly fitness or discipline tasks. Keeps the journey exciting and fuels constant progress.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  cut: [
                    {
                      'title': 'Follow A Strict Diet',
                      'description': 'Stick to a calorie-deficit, clean eating plan that prioritizes lean protein, fiber, and whole foods for definition.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Run 5 km Daily for 60 Days',
                      'description': 'Burn fat, improve endurance, and increase cardiovascular fitness with daily moderate-distance running.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Video Permission',
                      'Instruction': 'Allow access to Fitness Tracker & submit the 2 minute video proof of start and end',
                    },
                    {
                      'title': 'Burn or Cut 1,200 kcal/day',
                      'description': 'Maintain a deep caloric deficit through intense workouts and smart food tracking. Requires focus and control.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Photo Permission',
                      'Instruction': 'Upload food photos + fitness tracker screenshot of calories burned',
                    },
                    {
                      'title': 'Start With 10 Burpees from Day 1 and Reach 100 Burpees By Day 60',
                      'description': 'Boost metabolism and shred fat with a progressive bodyweight cardio challenge that builds discipline.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record full set of burpees daily',
                    },
                    {
                      'title': 'Reduce 7 kg Weight in 50 Days (Not For Beginners)',
                      'description': 'Target serious fat loss within a short window. Demands a tight routine, intense workouts, and zero cheat days.',
                      'completionRate': 50,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Photo',
                      'Instruction': 'Upload daily weigh-in photo with scale visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 60 Days for 30 MIN',
                      'description': 'Intense fat-melting HIIT sessions every day to burn maximum calories and tone lean muscle.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km Daily for 60 Days',
                      'description': 'Own your day from the start. Build strong habits and stamina with consistent early-morning runs.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 90 Days',
                      'description': 'Push your limits with a new physical or mental challenge every week to stay motivated and progressing.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  bulk: [
                    {
                      'title': 'Follow A Strict Bulking Diet',
                      'description': 'Eat calorie-dense, protein-rich meals on a set schedule to maximize muscle gain and minimize fat.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 900,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Wake Up at 5:00 AM',
                      'description': 'Start your day early to fit in meals, training, and recovery with maximum consistency and discipline.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Consume 4,000–5,000 kcal Daily',
                      'description': 'Fuel your body for hypertrophy by consistently hitting a large calorie surplus packed with nutrients.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals + calorie tracking app screenshot',
                    },
                    {
                      'title': 'Take 3 Protein Shakes Daily',
                      'description': 'Support muscle recovery and growth by supplementing your diet with protein-rich shakes throughout the day.',
                      'completionRate': 80,
                      'difficulty': 'Easy',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking each shake',
                    },
                    {
                      'title': 'Lift Heavy Weights, 4–5 Times a Week',
                      'description': 'Focus on hypertrophy and strength by lifting heavy with compound and isolation exercises regularly.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record 1 working set per exercise showing weights',
                    },
                    {
                      'title': 'Sleep 8 Hours Daily',
                      'description': 'Maximize recovery, muscle repair, and hormone balance with high-quality, uninterrupted sleep.',
                      'completionRate': 85,
                      'difficulty': 'Easy',
                      'participants': 1200,
                      'Proof': 'Permission',
                      'Instruction': 'Sync wearable sleep tracker data',
                    },
                    {
                      'title': 'Increase Strength in Compound Lifts',
                      'description': 'Track progress and aim to lift heavier in squats, deadlifts, and bench press to ensure progressive overload.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record PR attempts with clear weight visible',
                    },
                    {
                      'title': 'Gain 8 Kg in 45 Days',
                      'description': 'Aggressive bulking plan aimed at fast weight gain. Requires strict diet and intense gym sessions.',
                      'completionRate': 45,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly front/side progress photos with scale',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 90 Days',
                      'description': 'Keep pushing your limits and building grit with a new physical challenge every week.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  diet: [
                    {
                      'title': 'Follow A Strict Clean Diet',
                      'description': 'Cut out junk, sugar, and processed foods. Eat whole, nutrient-rich meals that support your fitness goal.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Follow The Diet Plan For 30 Days Without Breaking',
                      'description': 'Build consistency and reset your eating habits by following a clean meal plan with zero cheat days.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Drink One Glass of Karela Juice everyDay',
                      'description': 'Improve digestion, reduce blood sugar spikes, and detox your system with this bitter but powerful remedy.',
                      'completionRate': 65,
                      'difficulty': 'Moderate',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking the juice',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 60 Days for 30 MIN',
                      'description': 'Support your diet goals with high-intensity workouts to burn fat, tone up, and stay active daily.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 90 Days',
                      'description': 'Prevent boredom and test your commitment with weekly mini-missions that build mental strength.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  consistency: [
                    {
                      'title': 'Follow A Consistent Routine For 60 Days',
                      'description': 'Stick to a strict daily plan for 60 days without Skipping, reinforcing discipline and time management.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record 30-sec daily recap of completed tasks',
                    },
                    {
                      'title': 'Wake Up at 4:00 AM Every Day (No Skip)',
                      'description': 'Train your body and mind to rise early daily—building strong habits, willpower, and productivity.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Exercise 6 Days a Week Both Indoor & Outdoor',
                      'description': 'Balance your training across environments for all-round fitness, discipline, and mental toughness.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type',
                    },
                    {
                      'title': 'No Rest Days Until 60 Days, Strict Diet with Proper running',
                      'description': 'Push yourself physically and mentally with uninterrupted effort. No breaks, just results.',
                      'completionRate': 50,
                      'difficulty': 'Extreme',
                      'participants': 600,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record daily run + upload meal photos',
                    },
                    {
                      'title': 'Reduce Phone Time to 1 hr per day',
                      'description': 'Break digital addiction and reclaim focus by strictly limiting screen time to just 60 minutes a day.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Permission',
                      'Instruction': 'Allow Access to Mobile usage Tracker',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 60 Days for 30 MIN',
                      'description': 'Burn fat, improve endurance, and sharpen discipline through daily high-intensity workouts.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 90 Days',
                      'description': 'Stay motivated and tested with new challenges every week that build confidence and mental resilience.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                },
                '6': {
                  athlete: [
                    {
                      'title': 'Wake up at 4:00 AM',
                      'description': 'Start your day with unmatched discipline and mental clarity by rising early every morning.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Reduce Phone Time To 2 hours',
                      'description': 'Avoid digital time sinks and increase productivity by limiting screen time daily.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Permission',
                      'Instruction': 'Allow Access to Mobile usage Tracker',
                    },
                    {
                      'title': 'Do Surya Namaskar regularly for 150 Days, No Rest Days',
                      'description': 'Build flexibility, strength, and endurance with daily Surya Namaskars for 150 days straight.',
                      'completionRate': 40,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Video',
                      'Instruction': 'Record full 12-round Surya Namaskar session daily',
                    },
                    {
                      'title': 'Reach The Goal Of Running 20 Km Daily in 150 days with Starting from 2 Km daily',
                      'description': 'Train progressively to build stamina and strength, eventually hitting 20 km runs daily.',
                      'completionRate': 50,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker data showing distance',
                    },
                    {
                      'title': 'Get Shredded Legs by the end of the challenge',
                      'description': 'Achieve lean, muscular legs through consistent lower-body workouts and running.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 950,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly leg progress photos (front/side)',
                    },
                    {
                      'title': 'Do Wall sits for 150 days for 5 min daily',
                      'description': 'Build leg endurance and core strength with daily wall sits without fail.',
                      'completionRate': 65,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record full 5-minute wall sit with timer visible',
                    },
                    {
                      'title': 'Run 20 KM in 1 hr 30 min (with No Rest) For 60 Days',
                      'description': 'Master long-distance speed and mental grit by running 20km under 90 minutes daily.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker showing time/distance',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Push your limits with a new intense challenge every week to stay sharp and disciplined.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  weightgain: [
                    {
                      'title': 'Follow A Strict Weight Gaining Diet',
                      'description': 'Consume nutrient-rich meals aimed at muscle gain and calorie surplus.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1500,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'WAKE UP AT 4:00 AM',
                      'description': 'Develop mental resilience and maximize your active hours by waking early daily.',
                      'completionRate': 85,
                      'difficulty': 'Hard',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Phone Off at 8:00 PM EveryDay For 180 Days',
                      'description': 'Improve sleep and mental clarity by unplugging early every evening.',
                      'completionRate': 60,
                      'difficulty': 'Moderate',
                      'participants': 850,
                      'Proof': 'Permission',
                      'Instruction': 'Allow Access to Mobile usage Tracker',
                    },
                    {
                      'title': 'Run 4 km daily for 180 days (No Off Day)',
                      'description': 'Maintain cardiovascular health and metabolism during your bulk phase.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 900,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker data',
                    },
                    {
                      'title': 'Intake 3,200–3,500 kcal per day',
                      'description': 'Ensure a calorie surplus with a consistent intake for effective weight gain.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 950,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals + calorie tracking app screenshot',
                    },
                    {
                      'title': 'Drink 2 High-Calorie Shakes Daily',
                      'description': 'Supplement your meals with calorie-dense shakes to accelerate mass gain.',
                      'completionRate': 80,
                      'difficulty': 'Easy',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking each shake',
                    },
                    {
                      'title': 'Eat Every 3 Hours (Even When Not Hungry)',
                      'description': 'Fuel your body continuously to avoid catabolism and support growth.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record short clips of each meal/snack',
                    },
                    {
                      'title': 'Gain 11 Kg in 100 Days',
                      'description': 'Achieve measurable mass gain by following the structured plan closely.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 850,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly weigh-in photos with scale visible',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 180 Days',
                      'description': 'Stick to a custom meal plan for long-term nutritional consistency.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 150 Days',
                      'description': 'Break plateaus and improve willpower with new physical tasks each week.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  weightloss: [
                    {
                      'title': 'Follow A Strict Diet',
                      'description': 'Control your intake with a lean, fat-burning meal plan.',
                      'completionRate': 75,
                      'difficulty': 'Hard',
                      'participants': 1300,
                      'Proof': 'Photo',
                      'Instruction': 'Upload Photo of Whatever you eat everyday',
                    },
                    {
                      'title': 'Run 5 km daily for 150 days',
                      'description': 'Burn fat and increase stamina through regular medium-distance running.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker data',
                    },
                    {
                      'title': 'Burn or cut 1,200 kcal/day',
                      'description': 'Create a consistent calorie deficit to accelerate fat loss.',
                      'completionRate': 85,
                      'difficulty': 'Hard',
                      'participants': 1200,
                      'Proof': 'Photo Permission',
                      'Instruction': 'Upload food photos + fitness tracker screenshot of calories burned',
                    },
                    {
                      'title': 'Start With 10 Burpees from Day 1 and Reach 150 Burpees By Day 100',
                      'description': 'Gradually build explosive power and fat burn through burpee progressions.',
                      'completionRate': 50,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record full set of burpees daily',
                    },
                    {
                      'title': 'Reduce 12 kg weight in 100 Days (Not For Beginners)',
                      'description': 'Aim for significant fat loss through aggressive, consistent routines.',
                      'completionRate': 55,
                      'difficulty': 'Hard',
                      'participants': 800,
                      'Proof': 'Photo',
                      'Instruction': 'Upload daily weigh-in photo with scale visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 100 Days for 30 MIN',
                      'description': 'Torch calories and retain muscle with intense daily interval training.',
                      'completionRate': 70,
                      'difficulty': 'Hard',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km daily for 120 days',
                      'description': 'Combine early discipline and regular cardio to stay on track daily.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof',
                    },
                    {
                      'title': 'Do Both Indoor & Outdoor Workout Every Day For 150 Days, Only One Rest Day per Week',
                      'description': 'Maximize fat loss with dynamic and varied training environments.',
                      'completionRate': 60,
                      'difficulty': 'Moderate',
                      'participants': 900,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 180 Days',
                      'description': 'Stick with customized diet plans to maintain momentum and health.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1000,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Stay motivated and adaptive by taking on fresh weekly challenges.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing the weekly challenge',
                    },
                  ],
                  cut: [
                    {
                      'title': 'Follow A Strict Diet',
                      'description': 'Eat clean, low-calorie meals to preserve muscle and shed fat.',
                      'completionRate': 80,
                      'difficulty': 'Hard',
                      'participants': 1500,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals daily with calorie count visible',
                    },
                    {
                      'title': 'Run 7 km daily for 120 days',
                      'description': 'Elevate your endurance and calorie expenditure with daily longer runs.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1300,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run with GPS tracker showing distance + time',
                    },
                    {
                      'title': 'Burn or cut 1,200 kcal/day',
                      'description': 'Maintain a high-calorie deficit for visible body fat reduction.',
                      'completionRate': 85,
                      'difficulty': 'Hard',
                      'participants': 1200,
                      'Proof': 'Photo Permission',
                      'Instruction': 'Submit food photos + fitness tracker screenshot of calories burned',
                    },
                    {
                      'title': 'Start With 10 Burpees from Day 1 and Reach 120 Burpees By Day 100',
                      'description': 'Improve conditioning while steadily increasing burpee intensity.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record full set of burpees daily with count visible',
                    },
                    {
                      'title': 'Reduce 15 kg weight in 150 Days (Not For Beginners)',
                      'description': 'Aggressively target fat loss while preserving muscle tone.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Photo',
                      'Instruction': 'Upload daily weigh-in photo with scale clearly visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 150 Days for 30 MIN',
                      'description': 'Sculpt your body with high-intensity workouts done consistently.',
                      'completionRate': 65,
                      'difficulty': 'Hard',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km daily for 100 days',
                      'description': 'Develop consistent discipline and aerobic power through early runs.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 950,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof of distance/time',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Push past limits weekly to stay challenged and evolving.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  bulk: [
                    {
                      'title': 'Follow A Strict Bulking Diet',
                      'description': 'Stick to a calorie-surplus plan focused on clean, muscle-building nutrition.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1300,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals with calorie tracking app screenshot',
                    },
                    {
                      'title': 'Wake up at 5:00 AM',
                      'description': 'Start your day early to manage meal timing, workouts, and recovery.',
                      'completionRate': 90,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Consume 4,000–5,000 kcal daily',
                      'description': 'Fuel muscle growth and strength by eating large, balanced meals consistently.',
                      'completionRate': 80,
                      'difficulty': 'Hard',
                      'participants': 1150,
                      'Proof': 'Photo',
                      'Instruction': 'Submit photos of all meals + calorie tracking app screenshot',
                    },
                    {
                      'title': 'Take 3 Protein Shakes Daily',
                      'description': 'Support recovery and muscle repair with frequent protein intake.',
                      'completionRate': 90,
                      'difficulty': 'Easy',
                      'participants': 1250,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking each shake',
                    },
                    {
                      'title': 'Lift Heavy Weights, 4–5 Times a Week',
                      'description': 'Train with intensity to stimulate hypertrophy and strength gains.',
                      'completionRate': 85,
                      'difficulty': 'Hard',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record 1 working set per exercise showing weights and form',
                    },
                    {
                      'title': 'Sleep 8 Hours Daily',
                      'description': 'Allow full-body recovery and hormone optimization through quality sleep.',
                      'completionRate': 95,
                      'difficulty': 'Easy',
                      'participants': 1350,
                      'Proof': 'Permission',
                      'Instruction': 'Sync wearable sleep tracker data',
                    },
                    {
                      'title': 'Increase Strength in Compound Lifts',
                      'description': 'Progressively overload major lifts like squats, deadlifts, and bench presses.',
                      'completionRate': 80,
                      'difficulty': 'Hard',
                      'participants': 1200,
                      'Proof': 'Video',
                      'Instruction': 'Record PR attempts with clear weight visible',
                    },
                    {
                      'title': 'Gain 20 Kg in 100 Days',
                      'description': 'Aggressively bulk with a goal to put on significant mass.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 900,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly front/side progress photos with scale',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Stay accountable and improve willpower with structured challenges.',
                      'completionRate': 70,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  diet: [
                    {
                      'title': 'Follow A Strict Clean Diet',
                      'description': 'Eat whole, unprocessed foods to support muscle gain or fat loss goals.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals showing portion sizes',
                    },
                    {
                      'title': 'Follow The Diet Plan For 30 Days Without Breaking',
                      'description': 'Commit to nutrition consistency to build long-term healthy eating habits.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1100,
                      'Proof': 'Photo',
                      'Instruction': 'Submit daily meal photos as per diet plan',
                    },
                    {
                      'title': 'Drink One Glass of Karela Juice everyDay',
                      'description': 'Boost metabolism and detoxify the body with bitter gourd juice.',
                      'completionRate': 70,
                      'difficulty': 'Easy',
                      'participants': 900,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking the juice daily',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 120 Days for 30 MIN',
                      'description': 'Boost fat-burning and metabolic rate with consistent high-intensity sessions.',
                      'completionRate': 80,
                      'difficulty': 'Hard',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Evolve physically and mentally by embracing new weekly fitness goals.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  consistency: [
                    {
                      'title': 'Follow A Consistent Routine For 180 Days',
                      'description': 'Build powerful habits with a daily routine you stick to no matter what.',
                      'completionRate': 80,
                      'difficulty': 'Hard',
                      'participants': 1400,
                      'Proof': 'Video',
                      'Instruction': 'Record 30-sec daily recap of completed routine tasks',
                    },
                    {
                      'title': 'Wake Up at the 4:00 AM Every Day (No Skip)',
                      'description': 'Train yourself to be an early riser and boost productivity each day.',
                      'completionRate': 85,
                      'difficulty': 'Moderate',
                      'participants': 1300,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + morning activity to prove wake-up time',
                    },
                    {
                      'title': 'Exercise 6 Days a Week Both Indoor & Outdoor',
                      'description': 'Balance your fitness approach with both indoor and outdoor training.',
                      'completionRate': 75,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type daily',
                    },
                    {
                      'title': 'No Rest Days Until 100 Days',
                      'description': 'Strengthen your discipline and grit with 100 days of non-stop effort.',
                      'completionRate': 60,
                      'difficulty': 'Hard',
                      'participants': 950,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record daily workout + sync fitness tracker data',
                    },
                    {
                      'title': 'Reduce Phone Time to 1 hr perday',
                      'description': 'Cut out distractions and reclaim your time by limiting screen use daily.',
                      'completionRate': 85,
                      'difficulty': 'Easy',
                      'participants': 1400,
                      'Proof': 'Permission',
                      'Instruction': 'Allow access to mobile usage tracker',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 100 Days for 30 MIN',
                      'description': 'Improve cardiovascular health, stamina, and consistency with daily HIIT.',
                      'completionRate': 75,
                      'difficulty': 'Hard',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge EveryWeek For 120 Days',
                      'description': 'Challenge your comfort zone every week to stay sharp and motivated.',
                      'completionRate': 80,
                      'difficulty': 'Moderate',
                      'participants': 1200,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                },
                '12': {
                  athlete: [
                    {
                      'title': 'Wake up at 4:00 AM',
                      'description': 'Wake up early to set a productive tone for your day.',
                      'completionRate': '80%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + morning routine to prove wake-up time',
                    },
                    {
                      'title': 'Reduce Phone Time To 2 hours',
                      'description': 'Limit phone usage to enhance focus and productivity.',
                      'completionRate': '70%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Permission',
                      'Instruction': 'Allow access to mobile usage tracker',
                    },
                    {
                      'title': 'Do 20 Surya Namaskar regularly for 200 Days, No Rest Days',
                      'description': 'Perform this ancient exercise to improve flexibility, strength, and mindfulness.',
                      'completionRate': '75%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record full 20-round Surya Namaskar session daily',
                    },
                    {
                      'title': 'Run 10 km daily for 200 days',
                      'description': 'Build endurance and strength by running 10 km every day.',
                      'completionRate': '85%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker showing distance/time',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 200 Days',
                      'description': 'Challenge your comfort zone every week to stay sharp and motivated.',
                      'completionRate': '80%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                    {
                      'title': 'Get Shredded Body in 12 months',
                      'description': 'Transform your body by following a strict workout and nutrition plan.',
                      'completionRate': '70%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly front/side progress photos',
                    },
                  ],
                  weightgain: [
                    {
                      'title': 'Follow A Strict Weight Gaining Diet',
                      'description': 'Consume a high-calorie diet tailored to increase muscle mass.',
                      'completionRate': '90%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals with calorie count visible',
                    },
                    {
                      'title': 'WAKE UP AT 4:00 AM',
                      'description': 'Start your day early to increase productivity and consistency.',
                      'completionRate': '85%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + morning activity to prove wake-up time',
                    },
                    {
                      'title': 'Phone Off at 8:00 PM Every Day For 365 Days',
                      'description': 'Turn off your phone to ensure better sleep and rest.',
                      'completionRate': '60%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Permission',
                      'Instruction': 'Allow access to mobile usage tracker',
                    },
                    {
                      'title': 'Run 5 km daily for 200 days (No Off Day)',
                      'description': 'Maintain cardiovascular fitness while focusing on gaining weight.',
                      'completionRate': '75%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker showing distance/time',
                    },
                    {
                      'title': 'Intake 3,200–3,500 kcal per day',
                      'description': 'Eat enough to fuel your body for muscle growth and recovery.',
                      'completionRate': '90%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals + calorie tracking app screenshot',
                    },
                    {
                      'title': 'Drink 2 High-Calorie Shakes Daily',
                      'description': 'Add nutrient-dense shakes to boost your daily calorie intake.',
                      'completionRate': '80%',
                      'difficulty': 'Easy',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking each shake',
                    },
                    {
                      'title': 'Eat Every 3 Hours (Even When Not Hungry)',
                      'description': 'Ensure a steady flow of nutrients to maximize muscle gain.',
                      'completionRate': '70%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record short clips of each meal/snack throughout the day',
                    },
                    {
                      'title': 'Gain 20 Kg in 250 Days',
                      'description': 'Gradually increase your weight by sticking to a strict routine.',
                      'completionRate': '65%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly weigh-in photos with scale clearly visible',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 245 Days',
                      'description': 'Stay consistent with a diet plan for optimal weight gain results.',
                      'completionRate': '85%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 300 Days',
                      'description': 'Keep your motivation high by challenging yourself each week.',
                      'completionRate': '80%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  weightloss: [
                    {
                      'title': 'Run 10 km daily for 200 days',
                      'description': 'Maintain a consistent running routine to burn calories and lose weight.',
                      'completionRate': '80%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker showing distance/time',
                    },
                    {
                      'title': 'Burn or cut 1,200 kcal/day',
                      'description': 'Create a daily caloric deficit to lose weight effectively.',
                      'completionRate': '85%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Photo Permission',
                      'Instruction': 'Submit food photos + fitness tracker screenshot of calories burned',
                    },
                    {
                      'title': 'Start With 10 Burpees from Day 1 and Reach 100 Burpees By Day 200',
                      'description': 'Build strength and endurance by progressively increasing burpees.',
                      'completionRate': '70%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record full set of burpees daily with count visible',
                    },
                    {
                      'title': 'Reduce 18 kg weight in 200 Days (Not For Beginners)',
                      'description': 'Challenge yourself to lose weight through a disciplined regimen.',
                      'completionRate': '65%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload daily weigh-in photo with scale clearly visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 150 Days for 30 MIN',
                      'description': 'Boost metabolism and burn fat with intense HIIT workouts.',
                      'completionRate': '75%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km daily for 200 days',
                      'description': 'Kickstart your day with a morning run for fitness and weight loss.',
                      'completionRate': '80%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof',
                    },
                    {
                      'title': 'Do Both Indoor & Outdoor Workout Every Day For 250 Days, Only One Rest Day per Week',
                      'description': 'Mix indoor and outdoor activities to keep workouts exciting and effective.',
                      'completionRate': '70%',
                      'difficulty': 'Hard',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type daily',
                    },
                    {
                      'title': 'Follow The Diet Bundle For 365 Days',
                      'description': 'Stay consistent with your diet plan to maximize weight loss results.',
                      'completionRate': '80%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals as per diet plan',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 150 Days',
                      'description': 'Challenge yourself weekly to stay on track and push your limits.',
                      'completionRate': '75%',
                      'difficulty': 'Medium',
                      'participants': 1,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  cut: [
                    {
                      'title': 'Follow A Strict Diet',
                      'description': 'Stick to a diet plan focused on cutting body fat while preserving muscle.',
                      'completionRate': 85,
                      'difficulty': 'Intermediate',
                      'participants': 1500,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals with portion sizes and calorie count',
                    },
                    {
                      'title': 'Run 5 km daily for 200 days',
                      'description': 'Incorporate daily running into your routine for fat loss and endurance.',
                      'completionRate': 78,
                      'difficulty': 'Intermediate',
                      'participants': 1200,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record run + sync GPS tracker showing distance/time',
                    },
                    {
                      'title': 'Reduce 25 kg weight in 300 Days (Not For Beginners)',
                      'description': 'Commit to long-term weight loss by following a strict plan.',
                      'completionRate': 65,
                      'difficulty': 'Advanced',
                      'participants': 500,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly weigh-in photos with scale clearly visible',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 120 Days for 30 MIN',
                      'description': 'Follow a high-intensity interval training routine to shed fat quickly.',
                      'completionRate': 70,
                      'difficulty': 'Advanced',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Wake Up At 4:00 AM and Run 4 km daily for 180 days',
                      'description': 'Start each day with a run to burn fat and increase metabolism.',
                      'completionRate': 80,
                      'difficulty': 'Intermediate',
                      'participants': 1000,
                      'Proof': 'Video Permission',
                      'Instruction': 'Record sunrise run + fitness tracker proof',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 200 Days',
                      'description': 'Stay motivated and challenge yourself every week for continued progress.',
                      'completionRate': 90,
                      'difficulty': 'Intermediate',
                      'participants': 700,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  bulk: [
                    {
                      'title': 'Follow A Strict Bulking Diet',
                      'description': 'Consume more calories to build muscle mass and strength.',
                      'completionRate': 90,
                      'difficulty': 'Advanced',
                      'participants': 1300,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals with calorie tracking app screenshot',
                    },
                    {
                      'title': 'Wake up at 5:00 AM',
                      'description': 'Start your day early to increase productivity and stay consistent.',
                      'completionRate': 95,
                      'difficulty': 'Beginner',
                      'participants': 2000,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + 5 push-ups to prove wake-up time',
                    },
                    {
                      'title': 'Consume 4,000–5,000 kcal daily',
                      'description': 'Increase your calorie intake to support muscle growth and recovery.',
                      'completionRate': 85,
                      'difficulty': 'Intermediate',
                      'participants': 1100,
                      'Proof': 'Photo',
                      'Instruction': 'Submit photos of all meals + calorie tracking app screenshot',
                    },
                    {
                      'title': 'Take 3 Protein Shakes Daily',
                      'description': 'Incorporate protein shakes to enhance muscle repair and growth.',
                      'completionRate': 88,
                      'difficulty': 'Beginner',
                      'participants': 1600,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking each shake',
                    },
                    {
                      'title': 'Lift Heavy Weights, 4–5 Times a Week',
                      'description': 'Focus on strength training to build muscle and increase overall strength.',
                      'completionRate': 80,
                      'difficulty': 'Advanced',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record 1 working set per exercise showing weights and form',
                    },
                    {
                      'title': 'Sleep 8 Hours Daily',
                      'description': 'Ensure proper recovery by getting enough sleep each night.',
                      'completionRate': 98,
                      'difficulty': 'Beginner',
                      'participants': 2500,
                      'Proof': 'Permission',
                      'Instruction': 'Sync wearable sleep tracker data',
                    },
                    {
                      'title': 'Increase Strength in Compound Lifts',
                      'description': 'Focus on compound movements to build strength and muscle efficiently.',
                      'completionRate': 75,
                      'difficulty': 'Advanced',
                      'participants': 850,
                      'Proof': 'Video',
                      'Instruction': 'Record PR attempts with clear weight visible',
                    },
                    {
                      'title': 'Gain 20 Kg in 205 Days',
                      'description': 'Gain weight steadily by sticking to a well-planned bulking routine.',
                      'completionRate': 70,
                      'difficulty': 'Advanced',
                      'participants': 600,
                      'Proof': 'Photo',
                      'Instruction': 'Upload weekly front/side progress photos with scale',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 200 Days',
                      'description': 'Keep pushing your limits by setting weekly challenges for growth.',
                      'completionRate': 80,
                      'difficulty': 'Intermediate',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  diet: [
                    {
                      'title': 'Follow A Strict Clean Diet',
                      'description': 'Stick to a clean, nutritious diet to fuel your body for optimal performance.',
                      'completionRate': 85,
                      'difficulty': 'Intermediate',
                      'participants': 1200,
                      'Proof': 'Photo',
                      'Instruction': 'Upload photos of all meals showing portion sizes and ingredients',
                    },
                    {
                      'title': 'Follow The Diet Plan For 365 Days Without Breaking',
                      'description': 'Stay disciplined and consistent with your diet plan for long-term results.',
                      'completionRate': 70,
                      'difficulty': 'Advanced',
                      'participants': 500,
                      'Proof': 'Photo',
                      'Instruction': 'Submit daily meal photos as per diet plan',
                    },
                    {
                      'title': 'Drink One Glass of Karela Juice everyDay',
                      'description': 'Incorporate Karela juice for its health benefits and fat-burning properties.',
                      'completionRate': 80,
                      'difficulty': 'Intermediate',
                      'participants': 1000,
                      'Proof': 'Video',
                      'Instruction': 'Record yourself preparing and drinking the juice daily',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 300 Days for 30 MIN',
                      'description': 'Push your limits with daily HIIT workouts to burn fat and improve fitness.',
                      'completionRate': 75,
                      'difficulty': 'Advanced',
                      'participants': 800,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 200 Days',
                      'description': 'Challenge yourself weekly to stay engaged and motivated.',
                      'completionRate': 85,
                      'difficulty': 'Intermediate',
                      'participants': 950,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                  consistency: [
                    {
                      'title': 'Follow A Consistent Routine For 200 Days',
                      'description': 'Develop a habit by following a consistent routine every day.',
                      'completionRate': 80,
                      'difficulty': 'Intermediate',
                      'participants': 1300,
                      'Proof': 'Video',
                      'Instruction': 'Record 30-sec daily recap of completed routine tasks',
                    },
                    {
                      'title': 'Wake Up at the 4:00 AM Every Day (No Skip)',
                      'description': 'Start each day with discipline by waking up early every day.',
                      'completionRate': 85,
                      'difficulty': 'Advanced',
                      'participants': 1100,
                      'Proof': 'Video',
                      'Instruction': 'Record alarm clock + morning activity to prove wake-up time',
                    },
                    {
                      'title': 'Exercise 6 Days a Week Both Indoor & Outdoor',
                      'description': 'Maintain a balanced workout routine with both indoor and outdoor activities.',
                      'completionRate': 75,
                      'difficulty': 'Advanced',
                      'participants': 900,
                      'Proof': 'Video',
                      'Instruction': 'Record 1-min clip of each workout type daily',
                    },
                    {
                      'title': 'Reduce Phone Time to 3 hr per day',
                      'description': 'Limit phone usage to focus more on productive activities.',
                      'completionRate': 88,
                      'difficulty': 'Beginner',
                      'participants': 1700,
                      'Proof': 'Permission',
                      'Instruction': 'Allow access to mobile usage tracker',
                    },
                    {
                      'title': 'Do A Strict HIIT Workout Every Day For 200 Days for 30 MIN',
                      'description': 'Incorporate daily HIIT to maintain consistent fat loss and fitness.',
                      'completionRate': 70,
                      'difficulty': 'Advanced',
                      'participants': 600,
                      'Proof': 'Video',
                      'Instruction': 'Record entire 30-min HIIT session (can be sped up)',
                    },
                    {
                      'title': 'Perform Weekly Challenge Every Week For 200 Days',
                      'description': 'Challenge yourself every week to stay motivated and push your limits.',
                      'completionRate': 80,
                      'difficulty': 'Intermediate',
                      'participants': 750,
                      'Proof': 'Video',
                      'Instruction': 'Record a 1-min video completing each weekly challenge',
                    },
                  ],
                },
        };

        // Get goals for the user's timeline and challengeSubType
        const goals = goalsByTimelineAndSubType[timeline]?.[normalizedSubType];
        if (!goals) {
            throw new Error(`No challenges found for timeline ${timeline} and subtype ${normalizedSubType}`);
        }

        // Filter goals based on BMI and difficulty level
        let filteredGoals = [...goals];

        // Adjust difficulty based on BMI
        let preferredDifficulty = 'Intermediate';
        if (bmi >= 30) { // Obese
            preferredDifficulty = 'Beginner';
            filteredGoals = filteredGoals.filter(
                goal => goal.difficulty === 'Beginner' &&
                       !goal.title.includes('Run 10 km') &&
                       !goal.title.includes('Not For Beginners')
            );
        } else if (bmi < 18.5) { // Underweight
            preferredDifficulty = 'Beginner';
            filteredGoals = filteredGoals.filter(
                goal => !goal.title.includes('Reduce') &&
                       !goal.title.includes('Burn or cut')
            );
        } else if (bmi >= 25 && bmi < 30) { // Overweight
            preferredDifficulty = 'Intermediate';
            filteredGoals = filteredGoals.filter(
                goal => goal.difficulty !== 'Advanced' ||
                       (!goal.title.includes('Gain 20 Kg') &&
                        !goal.title.includes('Consume 4,000–5,000 kcal'))
            );
        } else { // Normal weight
            preferredDifficulty = 'Intermediate';
        }

        // Prioritize goals with preferred difficulty
        const preferredGoals = filteredGoals.filter(g => g.difficulty === preferredDifficulty);
        const otherGoals = filteredGoals.filter(g => g.difficulty !== preferredDifficulty);

        // Get unique categories from available goals
        const availableCategories = [...new Set(filteredGoals.map(g => g.category))];

        // Select one goal from each category
        const selectedGoals = [];
        const selectedCategories = new Set();

        // First try to select from preferred difficulty
        for (const category of availableCategories) {
            const categoryGoals = preferredGoals.filter(g => g.category === category);
            if (categoryGoals.length > 0 && selectedGoals.length < 3) {
                const randomIndex = Math.floor(Math.random() * categoryGoals.length);
                selectedGoals.push(categoryGoals[randomIndex]);
                selectedCategories.add(category);
            }
        }

        // Then fill from other difficulties if needed
        for (const category of availableCategories) {
            if (!selectedCategories.has(category) && selectedGoals.length < 3) {
                const categoryGoals = otherGoals.filter(g => g.category === category);
                if (categoryGoals.length > 0) {
                    const randomIndex = Math.floor(Math.random() * categoryGoals.length);
                    selectedGoals.push(categoryGoals[randomIndex]);
                    selectedCategories.add(category);
                }
            }
        }

        // Final fill if still not enough
        while (selectedGoals.length < 3 && filteredGoals.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredGoals.length);
            if (!selectedGoals.includes(filteredGoals[randomIndex])) {
                selectedGoals.push(filteredGoals[randomIndex]);
            }
            filteredGoals.splice(randomIndex, 1);
        }

        return selectedGoals;
    }

    const challengeDurations = [];
    let descriptions = [];
    let difficulties = [];
    let completionRate = [];
    let participants = [];
    let challenges = [];
    let Proof = [];
    let Instruction = [];

    try {
        const selectedChallenges = assignUserChallenges(ChallengeExist, ChallengeTimeline, bmi, heightCm, currentWeight);

        goal = selectedChallenges.map(challenge => challenge.title);
        descriptions = selectedChallenges.map(challenge => challenge.description);
        difficulties = selectedChallenges.map(challenge => challenge.difficulty);
        completionRate = selectedChallenges.map(challenge => challenge.completionRate);
        participants = selectedChallenges.map(challenge => challenge.participants);
        Proof = selectedChallenges.map(challenge => challenge.Proof);
        Instruction = selectedChallenges.map(challenge => challenge.Instruction);

        challengeDurations.push(...goal.map(challenge => extractDuration(challenge)));

        challenges = goal.map((title, i) => ({
            goal: title,
            description: descriptions[i] || '',
            duration: challengeDurations[i] || '',
            completionRate: completionRate[i] || '',
            participants: participants[i] || '',
            difficulty: difficulties[i] || '',
            Proof: Proof[i] || '',
            Instruction: Instruction[i] || '',
        }));

    } catch (error) {
        console.error('Error assigning challenges:', error);
        // Fallback challenges
        challenges = [
            {
                goal: '30-Minute Daily Workout for 90 Days',
                description: 'Commit to regular exercise to build a fitness habit',
                duration: 90,
                completionRate: 75,
                participants: 2000,
                difficulty: 'Beginner',
                Proof: 'Video',
                Instruction: 'Upload a Video of working out 30 minutes daily',
            },
            {
                goal: '10,000 Steps Daily for 90 Days',
                description: 'Increase daily activity level for better health',
                duration: 90,
                completionRate: 80,
                participants: 2500,
                difficulty: 'Beginner',
                Proof: 'Permission',
                Instruction: 'Allow access to your location to track steps',
            },
            {
                goal: 'Strength Training 3x/Week for 90 Days',
                description: 'Build muscle and improve metabolism',
                duration: 90,
                completionRate: 65,
                participants: 1500,
                difficulty: 'Intermediate',
                Proof: 'Video',
                Instruction: 'Upload a Video of strength training 3x/week',
            },
        ];
    }

    const assignedData = await Assignedmongo.create({
        AssignedChallenge: goal,
        AssignedChallengeDescription: descriptions,
        AssignedChallengeDuration: challengeDurations,
        AssignedChallengeDifficulty: difficulties,
        AssignedChallengeCompletionRate: completionRate,
        AssignedChallengeParticipants: participants,
        AssignedforUser: req.user._id,
        AssignedProof: Proof,
        AssignedInstruction: Instruction,
    });

    console.log(assignedData);
    user.AssignedChallenges.push(assignedData._id);
    await user.save();
    const Type = user.SelfChallenge.ChallengeType;

    res.status(200).json({ challenges, user, Type });
});

app.post('/Challenge-Confirmation', isloggedin, async (req, res) => {
    const { goal, description, completionRate, participants, difficulty, Type, Proof, Instruction } = req.body;

    try {

        const user = await usermongo.findOne({ email: req.user.email }).populate('AssignedPresentChallenge').populate({
            path: 'SelfChallenge',
            select: 'Status',
        });

        user.AssignedPresentChallenge = {
            goal,
            description,
            completionRate,
            participants,
            difficulty,
            Type: goal,
            Proof,
            Instruction,
        };
        user.SelfChallenge.Status = 'Both Challenge Alloted';
        await user.save();


        res.json({ success: true });
    } catch (err) {
        console.error('Error saving challenge:', err);
        res.json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/challenge-confirmation-page',isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email }).populate({
        path: 'SelfChallenge',
        select: 'Duration',
    });

    const Duration = user.SelfChallenge.Duration;

    const challenge = user.AssignedPresentChallenge;
    res.status(200).json({ challenge, Duration });
});

app.get('/Payment',isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email }).populate({
        path: 'SelfChallenge',
        select: 'Duration ChallengeName',
    });

    const Duration = user.SelfChallenge.Duration;
    const processingFee = 20;
    const ChallengeName = user.SelfChallenge.ChallengeName;

    let basePayment;
    if(Duration === '3'){
        basePayment = 1500;
    }else if(Duration === '6'){
        basePayment = 3600;
    }else{
        basePayment = 7000;
    }

    const TotalPayment = basePayment + processingFee;
    const FirstInstallment = Math.ceil(TotalPayment / Duration);

    res.status(200).json({ Duration, basePayment, processingFee, TotalPayment, FirstInstallment, ChallengeName, UserName: user.username, UserEmail: user.email, UserPhone: user.phone, user});
});

app.get('/Skip-Workout-Page',isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email });

    const processingFee = 1;
    const basePayment = 50;

    res.status(200).json({ basePayment, processingFee, UserName: user.username, UserEmail: user.email, UserPhone: user.phone, user});
});

app.post('/Skip-Workout-Page', isloggedin, async (req, res) => {
    try {
        const user = await usermongo.findOne({ email: req.user.email });

        if (user) {
            user.Skip = (user.Skip || 0) + 1;
            user.ActiveChallenge.skipDate = new Date();

            const endDate = new Date();
            endDate.setHours(endDate.getHours() + 24);

            user.ActiveChallenge.SkipEndDate = endDate;

            if (user.ActiveChallenge.EndDate) {
                const currentEndDate = new Date(user.ActiveChallenge.EndDate);
                currentEndDate.setDate(currentEndDate.getDate() + 1); // Add 1 day
                user.ActiveChallenge.EndDate = currentEndDate;
            }

            await user.save();
            res.status(200).json({ message: 'Skip count incremented', skipCount: user.Skip });
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/Payment-Challenge-Confirmed', isloggedin, async (req, res) => {

    const { amount_paid } = req.body;

    const user = await usermongo.findOne({ email: req.user.email }).populate({
        path: 'SelfChallenge',
        select: 'Duration',
    });
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const tomorrowIST = new Date(now.getTime() + 24 * 60 * 60 * 1000 + istOffset);


    user.ActiveChallenge = user.AssignedPresentChallenge;
    user.ActiveChallenge.Payment = amount_paid;
    user.ActiveChallenge.StartDate = tomorrowIST;
    if (user.SelfChallenge && user.SelfChallenge.Duration) {
        const durationInMonths = parseInt(user.SelfChallenge.Duration); // example: 3
        const endDate = new Date(tomorrowIST);
        endDate.setMonth(endDate.getMonth() + durationInMonths); // Add months

        user.ActiveChallenge.EndDate = endDate;
    }
    user.AssignedPresentChallenge = {};
    await user.save();
    res.redirect('/');
});

app.get('/SubmitProof', isloggedin, async (req, res) => {
    const user = await usermongo.findOne({ email: req.user.email });

    const Proof = user.ActiveChallenge.Proof;
    const Instruction = user.ActiveChallenge.Instruction;

    res.status(200).json({ Proof, Instruction });
});

app.get('/Profile', isloggedin, async (req, res) => {
  const user = await usermongo.findOne({ email : req.user.email });
  let Level;

  let ActiveNumber;

  if(user.ActiveChallenge){
    ActiveNumber = 1;
  }else{
    ActiveNumber = 0;
  }

  let Number = user.ShortActiveChallenge.length + ActiveNumber;

  if(user.ShortActiveChallenge.length < 2){
    Level = 'Beginner';
  }else if(user.ShortActiveChallenge.length < 5){
    Level = 'Intermediate';
  }else{
    Level = 'Advanced';
  }
  let diffInDays;

  const startDate = new Date(user.ActiveChallenge.StartDate);
  const now = new Date();

  const diffInMs = now - startDate; // difference in milliseconds
  diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if(diffInDays < 0){
    diffInDays = '0';
  }else{
    diffInDays = diffInDays;
  }

  const Payment = user.ActiveChallenge.Payment;
  console.log(Payment);

  res.status(200).json({ user, Level, Streak: diffInDays, Number, Payment });
});

app.get('/ShortActiveChallenge/:id', isloggedin, async (req, res) => {
  const user = await usermongo.findOne({ email: req.user.email }).populate('ShortActiveChallenge');
  const PROOF = await usermongo.findOne({email: req.user.email }).populate({
    path: 'ShortActiveChallenge.UserProof',
    model: 'Proof',
    select: 'Status',
  });

  const challengeIdToCheck = req.params.id;

  const challenge = user.ShortActiveChallenge.find(challengeEntry => {
        return challengeEntry.challengeId && challengeEntry.challengeId._id.toString() === challengeIdToCheck;
    });

    const ProofShort = PROOF.ShortActiveChallenge.find(challengeEntry => {
        return challengeEntry.challengeId && challengeEntry.challengeId._id.toString() === challengeIdToCheck;
    });
    console.log(challenge);

    let progress;

    if(challenge.CompleteRate){
      progress = challenge.CompleteRate;
    }else{
      progress = 0;
    }

    const daysInProgress = challenge.DaysCompleted || 0;


    const Status =  ProofShort.UserProof?.Status;


    res.status(200).json({ progress, daysInProgress, Status });
});

app.get('/CheckInDate/Check/:id', isloggedin, async (req, res) => {
  const challengeIdToCheck = req.params.id;

    const user = await usermongo.findOne({ email: req.user.email }).populate('ShortActiveChallenge.challengeId');

    if (!user || !user.ShortActiveChallenge || user.ShortActiveChallenge.length === 0) {
        return res.status(404).json({ message: 'No active challenges found for user.' });
    }

    // Find the matching challenge
    const challenge = user.ShortActiveChallenge.find(challengeEntry => {
        return challengeEntry.challengeId && challengeEntry.challengeId._id.toString() === challengeIdToCheck;
    });

    const checkInDate = new Date(challenge.CheckInDate);
    const now = new Date();

    const sameDay =
    checkInDate.getFullYear() === now.getFullYear() &&
    checkInDate.getMonth() === now.getMonth() &&
    checkInDate.getDate() === now.getDate();

  const isCheckedIn = sameDay;

  console.log("challenge 1 1", challenge.UserProof)

    res.status(200).json({ isCheckedIn });
});

app.get('/Products', async (req, res) => {
  const Products = await Shopmongo.find({});

  res.status(200).json({ Products });
});

app.post('/Cart/:id', isloggedin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usermongo.findOne({ email: req.user.email });
    const product = await Shopmongo.findById(id);

    // Check if product already exists in cart
    const alreadyInCart = user.Cart.some(item => item._id.equals(product._id));

    if (!alreadyInCart) {
      user.Cart.push(product);
      console.log(product);
      await user.save();
      res.json({ success: true, message: 'Product added to cart', Cart: 'true' });
    } else {
      res.json({ success: false, message: 'Product already in cart', Cart: 'true' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/Cart/Remove-:id', isloggedin, async (req, res) => {
  const { id } = req.params;
  const user = await usermongo.findOne({ email: req.user.email });
  user.Cart.pull(id);
  await user.save();
  res.status(200).json({ Cart: user.Cart });
});

app.get('/Cart/Data', isloggedin, async (req, res) => {
  const user = await usermongo.findOne({ email: req.user.email }).populate({
    path: 'Cart',
    select: 'Title Description Price Image Category Quantity',
  });

  res.status(200).json({ Cart: user.Cart });
});

const Order = require('./mongoose/Ordermongo');

app.post('/checkout', isloggedin, async (req, res) => {
  try {
    const user = await usermongo.findOne({ email: req.user.email });
    if (!user) {return res.status(404).json({ error: 'User not found' });}

    const order = new Order({
      user: user._id,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      pointsUsed: req.body.pointsUsed,
      shippingAddress: req.body.shippingAddress,
      orderDate: req.body.orderDate || new Date(),
    });

     const itemIds = req.body.items.map(item => item.id);

  for (const productId of itemIds) {
      const product = await Shopmongo.findById(productId);
      if (product) {
          product.Orders.push(order._id);
          await product.save();
      }
      console.log(product);
    }

    await order.save();

    user.Orders.push(order._id);
    await user.save();

    res.status(201).json({ success: true, message: 'Order placed', orderId: order._id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/UploadCheckIn/Proof/:id', upload.single('proof'), isloggedin, async (req, res) => {
    const challengeIdToCheck = req.params.id;

    const user = await usermongo.findOne({ email: req.user.email }).populate('ShortActiveChallenge.challengeId');


     const challenge = user.ShortActiveChallenge.find(challengeEntry => {
        return challengeEntry.challengeId && challengeEntry.challengeId._id.toString() === challengeIdToCheck;
    });

    challenge.CheckInDate = new Date();

    const totalDays = parseInt(challenge.challengeId.ChallengePeriod); // assuming it's a string like "7"

    // Get current completion rate or start at 0
    let currentPercentage = parseFloat(challenge.CompleteRate) || 0;

    // Calculate how many days have been marked complete so far
    const daysCompleted = Math.round((currentPercentage / 100) * totalDays);

    // Increment day and recalculate percentage
    const updatedDaysCompleted = daysCompleted + 1;
    const newPercentage = (updatedDaysCompleted / totalDays) * 100;

    // Update CompleteRate
    challenge.CompleteRate = newPercentage.toFixed(2); // as string
    challenge.DaysCompleted = (challenge.DaysCompleted || 0);

    const Proof = new Proofmongo({
        Proof: req.file.buffer,
        Status: 'Pending',
        Challenge: req.params.id,
        user: user._id,
    });

    challenge.UserProof = Proof._id;

    await Proof.save();

    await user.save();


    res.status(200).json({
        message: 'Check-in successful.',
        DaysCompleted: challenge.DaysCompleted,
        isCheckedIn: true,
        Status: Proof.Status,
    });
});


cron.schedule('5 0 * * *', async () => {
  const users = await usermongo.find({}).populate('ShortActiveChallenge.challengeId');

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Strip time

  for (let user of users) {
    for (let challenge of user.ShortActiveChallenge) {
      const checkInDate = new Date(challenge.CheckInDate);
      const checkInDateOnly = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());

      // Calculate how many full days have passed since last check-in
      const diffInTime = todayDateOnly - checkInDateOnly;
      const daysMissed = diffInTime / (1000 * 60 * 60 * 24); // Convert to days

      if (daysMissed >= 2) {  // Missed at least one full day in between
        console.log(`User ${user._id} failed challenge: ${challenge.challengeId.ChallengeName}`);

        // Optional: mark challenge as failed in DB
        await usermongo.updateOne(
          { _id: user._id, 'ShortActiveChallenge._id': challenge._id },
          { $set: { 'ShortActiveChallenge.$.ChallengeStatus': 'failed' } }
        );
      }else{
        console.log(`${user.username} did not fail challenge: ${challenge.challengeId.ChallengeName}`);
      }
    }
  }

});


cron.schedule('0 0 * * *', async () => {
  const users = await usermongo.find({})
    // first pull in the entire sub-array
    .populate({
      path: 'ShortActiveChallenge',
      populate: [
        { path: 'challengeId',   model: 'Short', select: 'ChallengePeriod' },
        { path: 'UserProof',     model: 'Proof', select: 'Status Challenge' }
      ]
    });

  for (let user of users) {
    for (let challenge of user.ShortActiveChallenge) {
      const proof = challenge.UserProof;
        if (proof) {
          if (proof.Status === 'Pending') {
            console.log('Proof is pending');
          } else if (proof.Status === 'Approved') {
            const totalDays = parseInt(challenge.challengeId.ChallengePeriod)

            let currentPercentage = parseFloat(challenge.CompleteRate) || 0;

          const daysCompleted = Math.round((currentPercentage / 100) * totalDays);

          const updatedDaysCompleted = daysCompleted + 1;
          const newPercentage = (updatedDaysCompleted / totalDays) * 100;

          challenge.CompleteRate = newPercentage.toFixed(2);

          challenge.DaysCompleted = (challenge.DaysCompleted || 0) + 1;

           await user.save();
          } else {
            let currentPercentage = parseFloat(challenge.CompleteRate) || 0;
            challenge.CompleteRate = currentPercentage.toFixed(2);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1); // subtract 1 day
            challenge.CheckInDate = yesterday;

            await user.save();
          }
        }
    }
  }
});




app.listen(3000);
