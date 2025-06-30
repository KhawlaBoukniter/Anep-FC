const Course = require('../models/Course');
const User = require('../models/User');

// Enrollment Rate
const getEnrollmentRate = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const unregisteredUsers = await User.countDocuments({ password: { $exists: false } });
        const enrolledUsers = totalUsers - unregisteredUsers;
        const enrollmentRate = (enrolledUsers / totalUsers) * 100;

        res.status(200).json({ total: totalUsers, enrolled: enrolledUsers, rate: enrollmentRate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Beneficiary Rate
const getBeneficiaryRate = async (req, res) => {
    try {
        const totalUsersWithPassword = await User.countDocuments({ password: { $exists: true, $ne: null } });
        const beneficiaries = await Course.distinct('assignedUsers').count();
        const beneficiaryRate = (beneficiaries / totalUsersWithPassword) * 100;

        res.status(200).json({ total: totalUsersWithPassword, beneficiaries: beneficiaries, rate: beneficiaryRate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Attendance Rate
const getAttendanceRate = async (req, res) => {
    try {
        const { userId } = req.params;
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth() + 1, 1); // Start from 12 months ago
        let courses;

        if (userId) {
            courses = await Course.find({
                'times.startTime': { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
                assignedUsers: userId
            }).populate('assignedUsers');
        } else {
            courses = await Course.find({
                'times.startTime': { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
            }).populate('assignedUsers');
        }

        const monthlyData = Array(12).fill().map(() => ({ attendedDays: 0, totalAssignedDays: 0 }));

        courses.forEach(course => {
            course.times.forEach(time => {
                const courseStartDate = new Date(time.startTime);
                const courseEndDate = new Date(time.endTime);
                const monthIndex = (courseStartDate.getMonth() - startDate.getMonth() + 12) % 12;
                const totalCourseDays = Math.ceil((courseEndDate - courseStartDate) / (1000 * 60 * 60 * 24));

                if (userId) {
                    const userPresence = course.presence.find(p => p.userId.toString() === userId);
                    if (userPresence) {
                        monthlyData[monthIndex].attendedDays += userPresence.daysPresent;
                        monthlyData[monthIndex].totalAssignedDays += totalCourseDays;
                    }
                } else {
                    const assignedUsers = course.assignedUsers.length;
                    monthlyData[monthIndex].totalAssignedDays += assignedUsers * totalCourseDays;
                    course.presence.forEach(p => {
                        monthlyData[monthIndex].attendedDays += p.daysPresent;
                    });
                }
            });
        });

        const chartData = monthlyData.map((data, index) => {
            const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
            return {
                month: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
                attendedDays: data.attendedDays,
                totalAssignedDays: data.totalAssignedDays,
                attendanceRate: data.totalAssignedDays > 0 ? (data.attendedDays / data.totalAssignedDays) * 100 : 0
            };
        });

        res.status(200).json(chartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Evaluation Scores
const getEvaluationScores = async (req, res) => {
    try {
        const { courseId } = req.params;
        const courses = courseId 
            ? await Course.find({ _id: courseId }).select('evaluations')
            : await Course.find().select('evaluations');

        const evaluationLabels = [
            "Apports d'informations",
            "Conception de la démarche",
            "Qualité de l'animation",
            "Conditions matérielles",
            "Adaptation aux tâches professionnelles",
            "Motivation à me perfectionner dans le domaine",
            "Réponse aux attentes",
            "Implication des participants"
        ];

        let totalScores = evaluationLabels.map(() => 0);
        let totalEvaluations = 0;

        courses.forEach(course => {
            course.evaluations.forEach(evaluation => {
                totalEvaluations++;
                evaluation.evaluationData.forEach((data, index) => {
                    totalScores[index] += data.value;
                });
            });
        });

        const averageScores = totalScores.map(score => totalEvaluations > 0 ? score / totalEvaluations : 0);

        const result = evaluationLabels.map((label, index) => ({
            axis: label,
            score: averageScores[index]
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Completion Rate
const getCompletionRate = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentDate = new Date();
        const courses = await Course.find({
            'times.endTime': { $lte: currentDate.toISOString() }
        }).populate('assignedUsers');

        const monthlyData = Array(12).fill().map(() => ({ completed: 0, total: 0 }));

        courses.forEach(course => {
            const courseEndDate = new Date(course.times[course.times.length - 1].endTime);
            const courseEndMonth = courseEndDate.getMonth();
            const totalCourseDays = course.times.reduce((total, time) => {
                const start = new Date(time.startTime);
                const end = new Date(time.endTime);
                return total + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            }, 0);

            if (userId) {
                const userPresence = course.presence.find(p => p.userId.toString() === userId);
                if (userPresence) {
                    monthlyData[courseEndMonth].total++;
                    if (userPresence.daysPresent === totalCourseDays) {
                        monthlyData[courseEndMonth].completed++;
                    }
                }
            } else {
                const totalParticipants = course.assignedUsers.length;
                const completedParticipants = course.presence.filter(p => p.daysPresent === totalCourseDays).length;
                monthlyData[courseEndMonth].total += totalParticipants;
                monthlyData[courseEndMonth].completed += completedParticipants;
            }
        });

        const chartData = monthlyData.map((data, index) => ({
            month: new Date(currentDate.getFullYear(), index, 1).toLocaleString('default', { month: 'long' }),
            completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
        }));

        res.status(200).json(chartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getEnrollmentRate,
    getBeneficiaryRate,
    getAttendanceRate,
    getEvaluationScores,
    getCompletionRate,
   
};