export default function handler(req: any, res: any) {
  res.status(200).json({ 
    status: 'Isolated function is working',
    time: new Date().toISOString()
  });
}
