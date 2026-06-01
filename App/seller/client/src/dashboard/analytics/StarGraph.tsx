import { BarChart } from '@mui/x-charts/BarChart';

export default function StarGraph() {
  return (
    <BarChart
      xAxis={[{ data: ['★', '★★', '★★★', '★★★★', '★★★★★']}]}
      series={[{data: [1, 8, 5, 7, 2], color: '#0b5a54'}]}
      height={300}
      width={500}
    />
  );
}
