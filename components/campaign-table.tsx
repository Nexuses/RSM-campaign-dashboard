import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const campaigns = [
  {
    date: "12/03/2025",
    name: "RSM SAUDI ESG MARGED DATA LINZY 26 NOV 2025 SET 1",
    project: "ESG",
    solution: "ESG General",
    tool: "Mailbluster",
    send: 1035,
    open: "28.50%",
    click: "23.00%",
    bounce: "34.63%",
  },
  {
    date: "12/04/2025",
    name: "RSM SAUDI ESG MARGED DATA LINZY 26 NO",
    project: "ESG",
    solution: "ESG",
    tool: "Mailbluster",
    send: 992,
    open: "40.12%",
    click: "34.17%",
    bounce: "11.20%",
  },
  {
    date: "12/07/2025",
    name: "ESG Cement Data",
    project: "ESG",
    solution: "ESG Cement",
    tool: "Brevo",
    send: 36,
    open: "38.89%",
    click: "100%",
    bounce: "2.63%",
  },
  {
    date: "12/08/2025",
    name: "RSM Saudi ESG Insurance",
    project: "ESG",
    solution: "ESG Insurance",
    tool: "Brevo",
    send: 78,
    open: "27.63%",
    click: "0%",
    bounce: "0%",
  },
  {
    date: "12/10/2025",
    name: "RSM SAUDI ESG MARGED DATA LINZY 26 NOV",
    project: "ESG",
    solution: "ESG",
    tool: "Mailbluster",
    send: 989,
    open: "43.12%",
    click: "35.32%",
    bounce: "3.74%",
  },
  {
    date: "12/02/2025",
    name: "RSM Fin Visual EDM",
    project: "Transitional Advisory",
    solution: "TA",
    tool: "Mailbluster",
    send: 1693,
    open: "47.90%",
    click: "26.64%",
    bounce: "7.01%",
  },
  {
    date: "12/03/2025",
    name: "RSM Fin Visual EDM",
    project: "Transitional Advisory",
    solution: "TA",
    tool: "Mailbluster",
    send: 1910,
    open: "37.02%",
    click: "29.53%",
    bounce: "15.60%",
  },
  {
    date: "12/07/2025",
    name: "RSM Fin Visual Followup EDM",
    project: "Transitional Advisory",
    solution: "TA",
    tool: "Mailbluster",
    send: 453,
    open: "38.41%",
    click: "32.67%",
    bounce: "2.63%",
  },
  {
    date: "12/02/2025",
    name: "RSM VAPT Visual EDM",
    project: "VAPT",
    solution: "VAPT",
    tool: "Mailbluster",
    send: 750,
    open: "42.46%",
    click: "31.99%",
    bounce: "28.39%",
  },
  {
    date: "12/02/2025",
    name: "RSM VAPT Visual EDM",
    project: "VAPT",
    solution: "VAPT",
    tool: "Mailbluster",
    send: 750,
    open: "29.01%",
    click: "22.60%",
    bounce: "24.80%",
  },
  {
    date: "12/03/2025",
    name: "RSM VAPT Visual EDM",
    project: "VAPT",
    solution: "VAPT",
    tool: "Mailbluster",
    send: 750,
    open: "16.52%",
    click: "13.26%",
    bounce: "24.40%",
  },
  {
    date: "12/03/2025",
    name: "RSM VAPT Visual EDM",
    project: "VAPT",
    solution: "VAPT",
    tool: "Mailbluster",
    send: 750,
    open: "44.08%",
    click: "32.46%",
    bounce: "31.44%",
  },
  {
    date: "12/10/2025",
    name: "VAPT text EDM 1 - folow up",
    project: "VAPT",
    solution: "VAPT",
    tool: "Mailbluster",
    send: 763,
    open: "36.05%",
    click: "-",
    bounce: "6.29%",
  },
]

export function CampaignTable() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Campaign Performance</CardTitle>
        <CardDescription>Detailed metrics for all campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="border-b">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Campaign Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Project</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Sent</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Open Rate</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Click Rate</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Bounce Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {campaigns.map((campaign, index) => (
                <tr key={index} className="border-b last:border-b-0 hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm text-slate-600">{campaign.date}</td>
                  <td className="py-4 px-4 text-sm text-slate-900 max-w-xs truncate font-medium" title={campaign.name}>
                    {campaign.name}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        campaign.project === "ESG"
                          ? "border-blue-300 text-blue-700 bg-blue-50"
                          : campaign.project === "Transitional Advisory"
                            ? "border-green-300 text-green-700 bg-green-50"
                            : "border-orange-300 text-orange-700 bg-orange-50"
                      }`}
                    >
                      {campaign.project}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-slate-900">
                    {campaign.send.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-slate-900">{campaign.open}</td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-slate-900">{campaign.click}</td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-slate-900">{campaign.bounce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
