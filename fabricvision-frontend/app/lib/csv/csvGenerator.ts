export function generateCSV(data: any, dateRange: { start: string; end: string }): string {
  const rows: string[][] = [];
  
  // Add header
  rows.push(['Report Period', `${dateRange.start} to ${dateRange.end}`]);
  rows.push(['Generated At', new Date().toISOString()]);
  rows.push([]);
  
  // Add summary
  rows.push(['SUMMARY']);
  rows.push(['Total Frames Processed', data.total_frames_processed?.toString() || '0']);
  rows.push(['Total Defect Frames', data.total_defect_frames?.toString() || '0']);
  rows.push(['Total Non-Defect Frames', data.total_non_defect_frames?.toString() || '0']);
  rows.push(['Defect Rate (%)', data.defect_rate_percentage?.toFixed(1) || '0']);
  rows.push(['Defect Free Rate (%)', data.defect_free_rate_percentage?.toFixed(1) || '100']);
  rows.push(['Average Processing Time (ms)', data.avg_processing_time_ms?.toFixed(2) || '0']);
  rows.push([]);
  
  // Add defect types breakdown
  rows.push(['DEFECT TYPE BREAKDOWN']);
  rows.push(['Type', 'Count', 'Percentage']);
  
  const totalDefects = data.total_defect_frames || 0;
  Object.entries(data.defect_type_counts || {}).forEach(([type, count]) => {
    const percentage = totalDefects > 0 ? ((Number(count) / totalDefects) * 100).toFixed(1) : '0';
    rows.push([type, String(count), `${percentage}%`]);
  });
  rows.push([]);
  
  // Add recent history if available
  if (data.recent_history && data.recent_history.length > 0) {
    rows.push(['RECENT DETECTIONS']);
    rows.push(['Timestamp', 'Filename', 'Defects Found', 'Processing Time (ms)']);
    
    data.recent_history.forEach((item: any) => {
      rows.push([
        item.timestamp || 'N/A',
        item.filename || 'N/A',
        item.defect_count?.toString() || '0',
        item.processing_time_ms?.toString() || 'N/A',
      ]);
    });
  }
  
  // Convert to CSV string
  return rows.map(row => row.map(cell => {
    // Escape commas and quotes
    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  }).join(',')).join('\n');
}