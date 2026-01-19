import { useEffect, useState } from 'react';
import EChartsReact from 'echarts-for-react';
import '../styles/admincharts.css';

interface AdminStats {
  total_users: number;
  predictions: number;
  approved_roles: number;
  flagged_predictions: number;
  model_accuracy: number;
}

interface TrendData {
  education_qualification: string;
  predicted_roles: string;
  count: number;
}

interface AdminChartsProps {
  stats: AdminStats;
  trends: TrendData[];
  loading: boolean;
}

export default function AdminCharts({ stats, trends, loading }: AdminChartsProps) {
  const [pieOption, setPieOption] = useState<any>(null);
  const [barOption, setBarOption] = useState<any>(null);

  useEffect(() => {
    if (!stats || loading) return;

    // Pie Chart - Prediction Status
    const pieData = [
      { value: stats.approved_roles, name: 'Approved' },
      { value: stats.flagged_predictions, name: 'Flagged' },
      { value: Math.max(0, stats.predictions - stats.approved_roles - stats.flagged_predictions), name: 'Pending' }
    ];

    setPieOption({
      title: {
        text: 'Prediction Status Distribution',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        top: 10,
      },
      legend: {
        orient: 'bottom',
        data: ['Approved', 'Flagged', 'Pending'],
        bottom: 10,
      },
      color: ['#2b8d3b', '#b72525', '#374151'],
      grid: {
        containLabel: true,
      },
      series: [
        {
          name: 'Predictions',
          type: 'pie',
          radius: '45%',
          center: ['50%', '55%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }, [stats, loading]);

  useEffect(() => {
    if (!trends || trends.length === 0 || loading) return;

    // Group trends by education qualification
    const educationMap: { [key: string]: { [role: string]: number } } = {};

    trends.forEach((item) => {
      if (!educationMap[item.education_qualification]) {
        educationMap[item.education_qualification] = {};
      }
      educationMap[item.education_qualification][item.predicted_roles] =
        (educationMap[item.education_qualification][item.predicted_roles] || 0) + item.count;
    });

    // Get all unique roles
    const allRoles = Array.from(new Set(trends.map((t) => t.predicted_roles))).sort();
    const educationLabels = Object.keys(educationMap).sort();

    // Create bar chart data
    const series = allRoles.map((role) => ({
      name: role,
      type: 'bar',
      data: educationLabels.map((edu) => educationMap[edu][role] || 0),
    }));

    setBarOption({
      title: {
        text: 'Predictions by Education & Job Role',
        left: 'center',
        top: 10,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: allRoles,
        bottom: 0,
        type: 'scroll',
        orient: 'horizontal',
      },
      xAxis: {
        type: 'category',
        data: educationLabels,
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Count',
      },
      grid: {
        bottom: 100,
        left: 60,
        right: 20,
        top: 60,
        containLabel: true,
      },
      series,
    });
  }, [trends, loading]);

  if (loading) {
    return (
      <div className="chartsWrapper">
        <div className="chartLoadingMessage">
          Loading visualizations...
        </div>
      </div>
    );
  }

  return (
    <div className="chartsWrapper">
      {pieOption && (
        <div className="chartContainer1">
          <EChartsReact 
            option={pieOption} 
            style={{ height: '450px', width: '100%' }} 
          />
        </div>
      )}

      {barOption && (
        <div className="chartContainer2">
          <EChartsReact 
            option={barOption} 
            style={{ height: '450px', width: '100%' }} 
          />
        </div>
      )}
    </div>
  );
}
