import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const VisitorCounter = () => {
    const { t } = useTranslation();
    const [totalVisits, setTotalVisits] = useState(0);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [displayTotal, setDisplayTotal] = useState(0);
    const [displayUnique, setDisplayUnique] = useState(0);

    useEffect(() => {
        // Get current counts from localStorage
        const storedTotalVisits = parseInt(localStorage.getItem('dplanner_total_visits') || '0', 10);
        const storedUniqueVisitors = parseInt(localStorage.getItem('dplanner_unique_visitors') || '0', 10);
        const isFirstVisit = !localStorage.getItem('dplanner_visited');

        // Increment total visits
        const newTotalVisits = storedTotalVisits + 1;

        // Increment unique visitors only on first visit
        const newUniqueVisitors = isFirstVisit ? storedUniqueVisitors + 1 : storedUniqueVisitors;

        // Save to localStorage
        localStorage.setItem('dplanner_total_visits', newTotalVisits.toString());
        localStorage.setItem('dplanner_unique_visitors', newUniqueVisitors.toString());
        localStorage.setItem('dplanner_visited', 'true');

        // Set state for animation
        setTotalVisits(newTotalVisits);
        setUniqueVisitors(newUniqueVisitors);

        // Animate numbers counting up
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setDisplayTotal(Math.floor(newTotalVisits * progress));
            setDisplayUnique(Math.floor(newUniqueVisitors * progress));

            if (currentStep >= steps) {
                clearInterval(timer);
                setDisplayTotal(newTotalVisits);
                setDisplayUnique(newUniqueVisitors);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num) => {
        return num.toLocaleString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4"
        >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 bg-white/5 backdrop-blur-sm">
                <Eye className="h-4 w-4 text-blue-400" />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">{t('common.totalVisits')}</span>
                    <span className="text-lg font-bold text-white counter">{formatNumber(displayTotal)}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 bg-white/5 backdrop-blur-sm">
                <Users className="h-4 w-4 text-green-400" />
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">{t('common.uniqueVisitors')}</span>
                    <span className="text-lg font-bold text-white counter">{formatNumber(displayUnique)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default VisitorCounter;
