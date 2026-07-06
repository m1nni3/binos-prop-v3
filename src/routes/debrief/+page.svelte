<script lang="ts">
  import { escHtml } from '$lib/api';

  const REPORTS = [
    { id: 1, title: 'Oakdale Q1 Financial Review', month: '2024-01', tags: ['Strategic', 'Operational'], summary: 'Comprehensive review of Oakdale property performance for Q1 2024.', sections: [{ heading: 'Financial Summary', content: 'Total income of R245,000 against expenses of R189,000. Net profit margin improved by 3.2% quarter-over-quarter.' }, { heading: 'Occupancy Analysis', content: '98.5% occupancy rate with 2 units undergoing minor renovation between tenants.' }, { heading: 'Maintenance Updates', content: 'Completed roof inspection on Block A. Plumbing upgrades scheduled for April.' }], financials: { income: 245000, expenses: 189000, variance: 56000 }, properties: ['Oakdale'], docs: ['Q1_Financial_Report.pdf', 'Oakdale_Inspection.pdf'] },
    { id: 2, title: 'Malindi Emergency Plumbing Repair', month: '2024-01', tags: ['Urgent', 'Operational'], summary: 'Emergency response to burst pipe in Unit 4B causing water damage.', sections: [{ heading: 'Incident Report', content: 'Burst pipe detected early morning. Water supply isolated within 30 minutes. Damage contained to 2 units.' }, { heading: 'Repair Status', content: 'Pipe replacement completed. Plastering and painting scheduled for next week.' }, { heading: 'Cost Impact', content: 'Emergency repair costs of R18,500 covered under insurance claim.' }], financials: { income: 0, expenses: 18500, variance: -18500 }, properties: ['Malindi'], docs: ['Insurance_Claim_001.pdf'] },
    { id: 3, title: 'Indaba Board Meeting Minutes', month: '2024-02', tags: ['Meeting', 'Legal'], summary: 'Minutes from the quarterly body corporate meeting.', sections: [{ heading: 'Key Decisions', content: 'Approved annual budget increase of 4.5%. New security contract awarded to Securitas.' }, { heading: 'Legal Matters', content: 'Levy dispute resolution ongoing with Unit 12 owner. Legal counsel engaged.' }, { heading: 'Upcoming Projects', content: 'Parking lot resurfacing approved for Q2. Budget allocation: R350,000.' }], financials: { income: 180000, expenses: 165000, variance: 15000 }, properties: ['Indaba'], docs: ['Board_Meeting_Minutes_Feb.pdf'] },
    { id: 4, title: 'Villeroy Forensic Audit Findings', month: '2024-02', tags: ['Forensic', 'Strategic'], summary: 'Results of the independent forensic audit on Villeroy trust accounts.', sections: [{ heading: 'Audit Scope', content: 'Review of all financial transactions from January 2023 to December 2023.' }, { heading: 'Key Findings', content: 'No material irregularities found. Minor discrepancies in petty cash reconciliations flagged for review.' }, { heading: 'Recommendations', content: 'Implement monthly reconciliation checks. Update petty cash procedures.' }], financials: { income: 320000, expenses: 298000, variance: 22000 }, properties: ['Villeroy'], docs: ['Forensic_Audit_2023.pdf', 'Recommendations.pdf'] },
    { id: 5, title: 'Oakdale Renovation Progress', month: '2024-03', tags: ['Operational', 'Strategic'], summary: 'Monthly update on Block B kitchen and bathroom renovations.', sections: [{ heading: 'Progress', content: '60% complete. Kitchen installations on track. Bathroom tiling 80% done.' }, { heading: 'Timeline', content: 'Expected completion by end of March. Two units ready for occupation by April 1st.' }, { heading: 'Budget Status', content: 'R185,000 of R280,000 budget spent. Within projected costs.' }], financials: { income: 0, expenses: 185000, variance: -185000 }, properties: ['Oakdale'], docs: ['Renovation_Progress_Report.pdf'] },
    { id: 6, title: 'Indaba Security Incident Report', month: '2024-03', tags: ['Urgent', 'Operational'], summary: 'Break-in attempt at basement storage area. Security response and prevention measures.', sections: [{ heading: 'Incident Details', content: 'Attempted forced entry at basement storage at 02:45 AM. Alarm triggered, response within 8 minutes.' }, { heading: 'Damage Assessment', content: 'Minor damage to security gate. No property stolen.' }, { heading: 'Prevention', content: 'Additional cameras installed. Security patrol frequency increased from 2-hour to 1-hour intervals.' }], financials: { income: 0, expenses: 12500, variance: -12500 }, properties: ['Indaba'], docs: ['Incident_Report_20240315.pdf'] },
    { id: 7, title: 'Malindi Quarterly Lease Review', month: '2024-03', tags: ['Legal', 'Strategic'], summary: 'Review of upcoming lease expirations and renewal negotiations.', sections: [{ heading: 'Lease Expirations', content: '3 leases expiring in Q2. 2 tenants confirmed for renewal, 1 negotiating.' }, { heading: 'Market Analysis', content: 'Rental rates in area increased 6.2% year-over-year. Recommend 5-7% increase for renewals.' }, { heading: 'Vacancy Risk', content: 'Low vacancy risk. All expiring leases have interested tenants.' }], financials: { income: 156000, expenses: 132000, variance: 24000 }, properties: ['Malindi'], docs: ['Lease_Review_Q1.pdf'] },
    { id: 8, title: 'Villeroy Compliance Update', month: '2024-03', tags: ['Legal', 'Operational'], summary: 'Status update on regulatory compliance and documentation requirements.', sections: [{ heading: 'Compliance Status', content: 'All municipal certificates current. Fire safety inspection passed. Electrical compliance certificate renewed.' }, { heading: 'Pending Items', content: 'Environmental assessment for parking area pending. Expected completion April.' }, { heading: 'Documentation', content: 'All property files digitized and backed up. Physical copies stored securely.' }], financials: { income: 315000, expenses: 289000, variance: 26000 }, properties: ['Villeroy'], docs: ['Compliance_Certificates.pdf'] },
  ];

  const TAG_COLORS: Record<string, string> = { Forensic: 'red', Legal: 'purple', Meeting: 'blue', Operational: 'green', Strategic: 'cyan', Urgent: 'orange' };

  let monthFilter = $state('all');
  let expandedReport = $state<number | null>(null);

  function getMonths() {
    return [...new Set(REPORTS.map(r => r.month))].sort().reverse();
  }

  function filtered() {
    if (monthFilter === 'all') return REPORTS;
    return REPORTS.filter(r => r.month === monthFilter);
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="page-title">Debrief Reports</h2>
    <select class="select-field py-2 text-sm" bind:value={monthFilter}>
      <option value="all">All Months</option>
      {#each getMonths() as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
  </div>

  {#each filtered() as r (r.id)}
    {@const expand = expandedReport === r.id}
    <div class="card cursor-pointer" class:ring-2 class:ring-binos-blue={expand} onclick={() => expandedReport = expand ? null : r.id}>
      <div class="p-4 border-l-4 border-l-{TAG_COLORS[r.tags[0]] || 'gray'}-500">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-medium">{escHtml(r.title)}</h3>
          <span class="text-xs text-binos-gray">{r.month}</span>
        </div>
        <div class="flex flex-wrap gap-1 mb-2">
          {#each r.tags as t}
            <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-{TAG_COLORS[t] || 'gray'}-100 text-{TAG_COLORS[t] || 'gray'}-800">{t}</span>
          {/each}
        </div>
        <p class="text-sm text-binos-gray">{escHtml(r.summary)}</p>
        {#if expand}
          <div class="mt-4 space-y-3 border-t border-binos-border pt-4">
            {#each r.sections as s}
              <div>
                <h4 class="font-medium text-sm mb-1">{escHtml(s.heading)}</h4>
                <p class="text-sm text-binos-gray/80">{escHtml(s.content)}</p>
              </div>
            {/each}
            <div class="grid grid-cols-3 gap-3 pt-2">
              <div class="text-center p-2 rounded bg-green-50"><div class="text-xs text-binos-gray">Income</div><div class="font-medium amount-positive">R{r.financials.income.toLocaleString()}</div></div>
              <div class="text-center p-2 rounded bg-red-50"><div class="text-xs text-binos-gray">Expenses</div><div class="font-medium amount-negative">R{r.financials.expenses.toLocaleString()}</div></div>
              <div class="text-center p-2 rounded bg-blue-50"><div class="text-xs text-binos-gray">Variance</div><div class="font-medium amount-neutral">R{r.financials.variance.toLocaleString()}</div></div>
            </div>
            {#if r.docs.length}
              <div class="pt-2"><div class="text-xs text-binos-gray mb-1">Source Documents</div>{#each r.docs as d}<div class="text-sm text-binos-blue hover:underline">{escHtml(d)}</div>{/each}</div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
