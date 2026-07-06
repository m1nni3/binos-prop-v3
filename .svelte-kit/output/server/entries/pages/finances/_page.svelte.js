import { e as ensure_array_like, a as attr_class } from "../../../chunks/index2.js";
import { e as escHtml, b as formatNumber, c as formatDate } from "../../../chunks/api.js";
import { I as ICONS } from "../../../chunks/icons.js";
import { e as escape_html, c as clsx } from "../../../chunks/attributes.js";
import { h as html } from "../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let state = {
      year: (/* @__PURE__ */ new Date()).getFullYear(),
      filterProp: "all",
      budgets: [],
      monthly: [],
      entries: [],
      properties: [],
      newEntry: {
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      },
      editCell: null
    };
    function getUniqueYears() {
      const years = /* @__PURE__ */ new Set();
      (state.monthly || []).forEach((m) => {
        if (m.year) years.add(m.year);
      });
      return Array.from(years).sort((a, b) => b - a);
    }
    function getFiltered() {
      let b = state.budgets, m = state.monthly, e = state.entries;
      if (state.year) {
        m = m.filter((x) => x.year === state.year);
        e = e.filter((x) => new Date(x.date).getFullYear() === state.year);
      }
      return { budgets: b, monthly: m, entries: e };
    }
    $$renderer2.push(`<div class="space-y-6">`);
    {
      $$renderer2.push("<!--[-1-->");
      const filtered = getFiltered();
      const totalIncome = filtered.monthly.reduce((s, m) => s + (m.income || 0), 0);
      const totalExpenses = filtered.monthly.reduce((s, m) => s + (m.expenses || 0), 0);
      $$renderer2.push(`<div class="kpi-row"><div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Income</div><div class="text-2xl font-display font-bold amount-positive">R${escape_html(totalIncome.toLocaleString("en-ZA"))}</div><div class="text-xs text-binos-gray mt-1">This ${escape_html(state.year)}</div></div> <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Expenses</div><div class="text-2xl font-display font-bold amount-negative">R${escape_html(totalExpenses.toLocaleString("en-ZA"))}</div><div class="text-xs text-binos-gray mt-1">This ${escape_html(state.year)}</div></div> <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Net Profit</div><div class="text-2xl font-display font-bold amount-neutral">R${escape_html((totalIncome - totalExpenses).toLocaleString("en-ZA"))}</div><div class="text-xs text-binos-gray mt-1">This ${escape_html(state.year)}</div></div> <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Budget vs Actual</div><div class="text-2xl font-display font-bold amount-positive">${escape_html((filtered.budgets.reduce((s, b) => s + (b.amount || 0), 0) - filtered.monthly.reduce((s, m) => s + (m.amount || 0), 0)).toLocaleString("en-ZA"))}</div><div class="text-xs text-binos-gray mt-1">Variance</div></div></div> <div class="card"><div class="card-header"><h3 class="page-title">Financial Dashboard</h3> <div class="flex items-center gap-3">`);
      $$renderer2.select({ class: "select-field text-sm", value: state.filterProp }, ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`All Properties`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(state.properties);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let p = each_array[$$index];
          $$renderer3.option({ value: p.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(escHtml(p.scheme_name))}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(` `);
      $$renderer2.select({ class: "select-field text-sm", value: state.year }, ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(getUniqueYears());
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let y = each_array_1[$$index_1];
          $$renderer3.option({ value: y }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(y)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(` <button class="btn-add btn-sm"><span class="mr-1">${html(ICONS.plus)}</span> Add Entry</button></div></div> <div class="card-body"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div><h4 class="text-sm font-medium text-binos-gray mb-3">Income vs Expenses</h4><div class="h-80"><canvas id="income-chart"></canvas></div></div> <div><h4 class="text-sm font-medium text-binos-gray mb-3">Budget vs Actual</h4><div class="h-80"><canvas id="budget-chart"></canvas></div></div></div></div></div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="card"><div class="card-header"><h3 class="page-title">Budget Breakdown</h3><span class="text-xs text-binos-gray">Click amount to edit</span></div> <div class="card-body"><div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Budget Amount</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Last Updated</th></tr></thead><tbody><!--[-->`);
      const each_array_2 = ensure_array_like(filtered.budgets);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let budget = each_array_2[$$index_2];
        $$renderer2.push(`<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors"><td class="px-4 py-3 font-medium">${escape_html(escHtml(budget.category))}</td><td class="px-4 py-3"><span${attr_class(clsx(budget.amount >= 0 ? "amount-positive" : "amount-negative"))}>`);
        if (state.editCell?.id === budget.id && state.editCell?.field === "amount") ;
        else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(formatNumber(budget.amount))}`);
        }
        $$renderer2.push(`<!--]--></span></td><td class="px-4 py-3 text-binos-gray text-sm">${escape_html(formatDate(budget.last_updated || (/* @__PURE__ */ new Date()).toISOString()))}</td></tr>`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div> <div class="card"><div class="card-header"><h3 class="page-title">Monthly Actuals</h3></div> <div class="card-body"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="px-4 py-3 text-left font-medium text-binos-gray sticky left-0 bg-binos-light/50">Category</th><!--[-->`);
      const each_array_3 = ensure_array_like([
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ]);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let month = each_array_3[$$index_3];
        $$renderer2.push(`<th class="px-2 py-3 text-center font-medium text-binos-gray text-xs">${escape_html(month)}</th>`);
      }
      $$renderer2.push(`<!--]--></tr></thead><tbody><!--[-->`);
      const each_array_4 = ensure_array_like([...new Set(filtered.monthly.map((m) => m.category))]);
      for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
        let cat = each_array_4[$$index_5];
        const catData = filtered.monthly.filter((m) => m.category === cat);
        $$renderer2.push(`<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors"><td class="px-4 py-2 font-medium sticky left-0 bg-white">${escape_html(escHtml(cat))}</td><!--[-->`);
        const each_array_5 = ensure_array_like([
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ]);
        for (let $$index_4 = 0, $$length2 = each_array_5.length; $$index_4 < $$length2; $$index_4++) {
          let month = each_array_5[$$index_4];
          const data = catData.find((m) => m.month === month) || { amount: 0 };
          $$renderer2.push(`<td class="px-2 py-2 text-center"><span${attr_class(clsx(data.amount > 0 ? "amount-positive" : data.amount < 0 ? "amount-negative" : "amount-neutral"))}>${escape_html(formatNumber(data.amount || 0))}</span></td>`);
        }
        $$renderer2.push(`<!--]--></tr>`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div></div> <div class="card"><div class="card-header"><h3 class="page-title">Financial Entries</h3></div> <div class="card-body"><div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="text-left px-4 py-3 font-medium text-binos-gray">Date</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Description</th><th class="text-right px-4 py-3 font-medium text-binos-gray">Amount</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Property</th></tr></thead><tbody><!--[-->`);
      const each_array_6 = ensure_array_like(filtered.entries);
      for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
        let entry = each_array_6[$$index_6];
        $$renderer2.push(`<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors"><td class="px-4 py-3 text-binos-gray">${escape_html(formatDate(entry.date))}</td><td class="px-4 py-3 font-medium">${escape_html(escHtml(entry.category))}</td><td class="px-4 py-3">${escape_html(escHtml(entry.description))}</td><td class="px-4 py-3 text-right"><span${attr_class(clsx(entry.amount > 0 ? "amount-positive" : "amount-negative"))}>`);
        if (state.editCell?.id === entry.id && state.editCell?.field === "amount") ;
        else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(entry.amount > 0 ? "+" : "")}${escape_html(formatNumber(entry.amount))}`);
        }
        $$renderer2.push(`<!--]--></span></td><td class="px-4 py-3 text-binos-gray">${escape_html(escHtml(state.properties.find((p) => p.id === entry.property_id)?.scheme_name || entry.property_id))}</td></tr>`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
