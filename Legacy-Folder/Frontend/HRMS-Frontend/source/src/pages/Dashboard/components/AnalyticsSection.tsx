import { Grid } from "@mui/material";
import AnalyticEcommerce from "@/components/cards/statistics/AnalyticEcommerce";

interface AnalyticsItem {
    title: string;
    count: number;
    percentage: number;
    icon: JSX.Element;
    isLoss?: boolean;
    color?: string;
}

interface AnalyticsSectionProps {
    data: AnalyticsItem[];
}

const AnalyticsSection = ({ data }: AnalyticsSectionProps) => {
    return (
        <>
            {data.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                    <AnalyticEcommerce {...item} />
                </Grid>
            ))}
        </>
    );
};

export default AnalyticsSection;