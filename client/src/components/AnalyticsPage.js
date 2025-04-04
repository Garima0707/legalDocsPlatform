import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AnalyticsDashboard from './AnalyticsDashboard';

const AnalyticsPage = () => {
    const [searchParams] = useSearchParams();
    const documentId = searchParams.get('documentId');

    if (!documentId) {
        return <p>Document ID is missing!</p>;
    }

    return <AnalyticsDashboard documentId={documentId} />;
};

export default AnalyticsPage;
