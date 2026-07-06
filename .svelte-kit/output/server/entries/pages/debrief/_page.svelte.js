import { e as ensure_array_like, a as attr_class, b as stringify } from "../../../chunks/index2.js";
import { e as escHtml } from "../../../chunks/api.js";
import { e as escape_html } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const REPORTS = [
      {
        id: 1,
        title: "Oakdale Q1 Financial Review",
        month: "2024-01",
        tags: ["Strategic", "Operational"],
        summary: "Comprehensive review of Oakdale property performance for Q1 2024.",
        sections: [
          {
            heading: "Financial Summary",
            content: "Total income of R245,000 against expenses of R189,000. Net profit margin improved by 3.2% quarter-over-quarter."
          },
          {
            heading: "Occupancy Analysis",
            content: "98.5% occupancy rate with 2 units undergoing minor renovation between tenants."
          },
          {
            heading: "Maintenance Updates",
            content: "Completed roof inspection on Block A. Plumbing upgrades scheduled for April."
          }
        ],
        financials: { income: 245e3, expenses: 189e3, variance: 56e3 },
        properties: ["Oakdale"],
        docs: ["Q1_Financial_Report.pdf", "Oakdale_Inspection.pdf"]
      },
      {
        id: 2,
        title: "Malindi Emergency Plumbing Repair",
        month: "2024-01",
        tags: ["Urgent", "Operational"],
        summary: "Emergency response to burst pipe in Unit 4B causing water damage.",
        sections: [
          {
            heading: "Incident Report",
            content: "Burst pipe detected early morning. Water supply isolated within 30 minutes. Damage contained to 2 units."
          },
          {
            heading: "Repair Status",
            content: "Pipe replacement completed. Plastering and painting scheduled for next week."
          },
          {
            heading: "Cost Impact",
            content: "Emergency repair costs of R18,500 covered under insurance claim."
          }
        ],
        financials: { income: 0, expenses: 18500, variance: -18500 },
        properties: ["Malindi"],
        docs: ["Insurance_Claim_001.pdf"]
      },
      {
        id: 3,
        title: "Indaba Board Meeting Minutes",
        month: "2024-02",
        tags: ["Meeting", "Legal"],
        summary: "Minutes from the quarterly body corporate meeting.",
        sections: [
          {
            heading: "Key Decisions",
            content: "Approved annual budget increase of 4.5%. New security contract awarded to Securitas."
          },
          {
            heading: "Legal Matters",
            content: "Levy dispute resolution ongoing with Unit 12 owner. Legal counsel engaged."
          },
          {
            heading: "Upcoming Projects",
            content: "Parking lot resurfacing approved for Q2. Budget allocation: R350,000."
          }
        ],
        financials: { income: 18e4, expenses: 165e3, variance: 15e3 },
        properties: ["Indaba"],
        docs: ["Board_Meeting_Minutes_Feb.pdf"]
      },
      {
        id: 4,
        title: "Villeroy Forensic Audit Findings",
        month: "2024-02",
        tags: ["Forensic", "Strategic"],
        summary: "Results of the independent forensic audit on Villeroy trust accounts.",
        sections: [
          {
            heading: "Audit Scope",
            content: "Review of all financial transactions from January 2023 to December 2023."
          },
          {
            heading: "Key Findings",
            content: "No material irregularities found. Minor discrepancies in petty cash reconciliations flagged for review."
          },
          {
            heading: "Recommendations",
            content: "Implement monthly reconciliation checks. Update petty cash procedures."
          }
        ],
        financials: { income: 32e4, expenses: 298e3, variance: 22e3 },
        properties: ["Villeroy"],
        docs: ["Forensic_Audit_2023.pdf", "Recommendations.pdf"]
      },
      {
        id: 5,
        title: "Oakdale Renovation Progress",
        month: "2024-03",
        tags: ["Operational", "Strategic"],
        summary: "Monthly update on Block B kitchen and bathroom renovations.",
        sections: [
          {
            heading: "Progress",
            content: "60% complete. Kitchen installations on track. Bathroom tiling 80% done."
          },
          {
            heading: "Timeline",
            content: "Expected completion by end of March. Two units ready for occupation by April 1st."
          },
          {
            heading: "Budget Status",
            content: "R185,000 of R280,000 budget spent. Within projected costs."
          }
        ],
        financials: { income: 0, expenses: 185e3, variance: -185e3 },
        properties: ["Oakdale"],
        docs: ["Renovation_Progress_Report.pdf"]
      },
      {
        id: 6,
        title: "Indaba Security Incident Report",
        month: "2024-03",
        tags: ["Urgent", "Operational"],
        summary: "Break-in attempt at basement storage area. Security response and prevention measures.",
        sections: [
          {
            heading: "Incident Details",
            content: "Attempted forced entry at basement storage at 02:45 AM. Alarm triggered, response within 8 minutes."
          },
          {
            heading: "Damage Assessment",
            content: "Minor damage to security gate. No property stolen."
          },
          {
            heading: "Prevention",
            content: "Additional cameras installed. Security patrol frequency increased from 2-hour to 1-hour intervals."
          }
        ],
        financials: { income: 0, expenses: 12500, variance: -12500 },
        properties: ["Indaba"],
        docs: ["Incident_Report_20240315.pdf"]
      },
      {
        id: 7,
        title: "Malindi Quarterly Lease Review",
        month: "2024-03",
        tags: ["Legal", "Strategic"],
        summary: "Review of upcoming lease expirations and renewal negotiations.",
        sections: [
          {
            heading: "Lease Expirations",
            content: "3 leases expiring in Q2. 2 tenants confirmed for renewal, 1 negotiating."
          },
          {
            heading: "Market Analysis",
            content: "Rental rates in area increased 6.2% year-over-year. Recommend 5-7% increase for renewals."
          },
          {
            heading: "Vacancy Risk",
            content: "Low vacancy risk. All expiring leases have interested tenants."
          }
        ],
        financials: { income: 156e3, expenses: 132e3, variance: 24e3 },
        properties: ["Malindi"],
        docs: ["Lease_Review_Q1.pdf"]
      },
      {
        id: 8,
        title: "Villeroy Compliance Update",
        month: "2024-03",
        tags: ["Legal", "Operational"],
        summary: "Status update on regulatory compliance and documentation requirements.",
        sections: [
          {
            heading: "Compliance Status",
            content: "All municipal certificates current. Fire safety inspection passed. Electrical compliance certificate renewed."
          },
          {
            heading: "Pending Items",
            content: "Environmental assessment for parking area pending. Expected completion April."
          },
          {
            heading: "Documentation",
            content: "All property files digitized and backed up. Physical copies stored securely."
          }
        ],
        financials: { income: 315e3, expenses: 289e3, variance: 26e3 },
        properties: ["Villeroy"],
        docs: ["Compliance_Certificates.pdf"]
      }
    ];
    const TAG_COLORS = {
      Forensic: "red",
      Legal: "purple",
      Meeting: "blue",
      Operational: "green",
      Strategic: "cyan",
      Urgent: "orange"
    };
    let monthFilter = "all";
    let expandedReport = null;
    function getMonths() {
      return [...new Set(REPORTS.map((r) => r.month))].sort().reverse();
    }
    function filtered() {
      return REPORTS;
    }
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><h2 class="page-title">Debrief Reports</h2> `);
    $$renderer2.select({ class: "select-field py-2 text-sm", value: monthFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "all" }, ($$renderer4) => {
        $$renderer4.push(`All Months`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(getMonths());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$renderer3.option({ value: m }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(m)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</div> <!--[-->`);
    const each_array_1 = ensure_array_like(filtered());
    for (let $$index_4 = 0, $$length = each_array_1.length; $$index_4 < $$length; $$index_4++) {
      let r = each_array_1[$$index_4];
      const expand = expandedReport === r.id;
      $$renderer2.push(`<div${attr_class("card cursor-pointer", void 0, { "ring-2": ring - 2, "ring-binos-blue": expand })}><div${attr_class(`p-4 border-l-4 border-l-${stringify(TAG_COLORS[r.tags[0]] || "gray")}-500`)}><div class="flex items-start justify-between mb-2"><h3 class="font-medium">${escape_html(escHtml(r.title))}</h3> <span class="text-xs text-binos-gray">${escape_html(r.month)}</span></div> <div class="flex flex-wrap gap-1 mb-2"><!--[-->`);
      const each_array_2 = ensure_array_like(r.tags);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let t = each_array_2[$$index_1];
        $$renderer2.push(`<span${attr_class(`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-${stringify(TAG_COLORS[t] || "gray")}-100 text-${stringify(TAG_COLORS[t] || "gray")}-800`)}>${escape_html(t)}</span>`);
      }
      $$renderer2.push(`<!--]--></div> <p class="text-sm text-binos-gray">${escape_html(escHtml(r.summary))}</p> `);
      if (expand) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mt-4 space-y-3 border-t border-binos-border pt-4"><!--[-->`);
        const each_array_3 = ensure_array_like(r.sections);
        for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
          let s = each_array_3[$$index_2];
          $$renderer2.push(`<div><h4 class="font-medium text-sm mb-1">${escape_html(escHtml(s.heading))}</h4> <p class="text-sm text-binos-gray/80">${escape_html(escHtml(s.content))}</p></div>`);
        }
        $$renderer2.push(`<!--]--> <div class="grid grid-cols-3 gap-3 pt-2"><div class="text-center p-2 rounded bg-green-50"><div class="text-xs text-binos-gray">Income</div><div class="font-medium amount-positive">R${escape_html(r.financials.income.toLocaleString())}</div></div> <div class="text-center p-2 rounded bg-red-50"><div class="text-xs text-binos-gray">Expenses</div><div class="font-medium amount-negative">R${escape_html(r.financials.expenses.toLocaleString())}</div></div> <div class="text-center p-2 rounded bg-blue-50"><div class="text-xs text-binos-gray">Variance</div><div class="font-medium amount-neutral">R${escape_html(r.financials.variance.toLocaleString())}</div></div></div> `);
        if (r.docs.length) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="pt-2"><div class="text-xs text-binos-gray mb-1">Source Documents</div><!--[-->`);
          const each_array_4 = ensure_array_like(r.docs);
          for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
            let d = each_array_4[$$index_3];
            $$renderer2.push(`<div class="text-sm text-binos-blue hover:underline">${escape_html(escHtml(d))}</div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
