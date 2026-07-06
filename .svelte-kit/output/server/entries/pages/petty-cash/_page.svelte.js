import { e as ensure_array_like, a as attr_class } from "../../../chunks/index2.js";
import { d as formatCurrency, e as escHtml, c as formatDate, a as apiClient } from "../../../chunks/api.js";
import { t as toast } from "../../../chunks/stores.js";
import { e as escape_html } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = { income: [], expenses: [] };
    let filterProp = "all";
    let properties = [];
    ({
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    ({
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    async function loadData() {
      try {
        const [inc, exp, props] = await Promise.all([
          apiClient.get("/petty-cash/income"),
          apiClient.get("/petty-cash/expenses"),
          apiClient.get("/properties")
        ]);
        data = {
          income: Array.isArray(inc) ? inc : [],
          expenses: Array.isArray(exp) ? exp : []
        };
        properties = props || [];
      } catch {
        toast("error", "Failed to load petty cash");
      }
    }
    function filteredIncome() {
      return data.income.filter((i) => filterProp === "all");
    }
    function filteredExpenses() {
      return data.expenses.filter((e) => filterProp === "all");
    }
    function totalIncome() {
      return filteredIncome().reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    }
    function totalExpenses() {
      return filteredExpenses().reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    }
    function balance() {
      return totalIncome() - totalExpenses();
    }
    function propName(id) {
      return properties.find((p) => p.id === id)?.scheme_name || "Unknown";
    }
    loadData();
    $$renderer2.push(`<div class="space-y-6"><div class="kpi-row"><div class="kpi-card border-l-binos-green"><div class="text-sm text-binos-gray mb-1">Total Income</div><div class="text-2xl font-display font-bold amount-positive">${escape_html(formatCurrency(totalIncome()))}</div></div> <div class="kpi-card border-l-binos-red"><div class="text-sm text-binos-gray mb-1">Total Expenses</div><div class="text-2xl font-display font-bold amount-negative">${escape_html(formatCurrency(totalExpenses()))}</div></div> <div class="kpi-card border-l-binos-blue"><div class="text-sm text-binos-gray mb-1">Balance</div><div class="text-2xl font-display font-bold amount-neutral">${escape_html(formatCurrency(balance()))}</div></div></div> <div class="flex items-center gap-3">`);
    $$renderer2.select({ class: "select-field py-2 text-sm", value: filterProp }, ($$renderer3) => {
      $$renderer3.option({ value: "all" }, ($$renderer4) => {
        $$renderer4.push(`All Properties`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(properties);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let p = each_array[$$index];
        $$renderer3.option({ value: p.id }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(p.scheme_name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(` <button class="btn-add btn-sm">+ Income</button> <button class="btn-secondary btn-sm">+ Expense</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="card"><div class="card-header"><h3 class="font-medium">Entries</h3></div> <div class="divide-y divide-binos-border/50">`);
    const each_array_3 = ensure_array_like([
      ...filteredIncome().map((e) => ({ ...e, type: "income" })),
      ...filteredExpenses().map((e) => ({ ...e, type: "expense" }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    if (each_array_3.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let e = each_array_3[$$index_3];
        $$renderer2.push(`<div${attr_class("flex items-center justify-between px-5 py-3 border-l-4", void 0, {
          "border-l-binos-green": e.type === "income",
          "border-l-binos-red": e.type !== "income"
        })}><div><div class="font-medium text-sm">${escape_html(escHtml(e.description))}</div> <div class="text-xs text-binos-gray">${escape_html(propName(e.property_id))} · ${escape_html(formatDate(e.date))}</div></div> <div class="flex items-center gap-3"><span${attr_class("font-semibold", void 0, {
          "amount-positive": e.type === "income",
          "amount-negative": e.type !== "income"
        })}>${escape_html(e.type === "income" ? "+" : "-")}${escape_html(formatCurrency(e.amount))}</span> <button class="text-binos-gray hover:text-binos-red"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="p-6 text-center text-binos-gray">No entries found</div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
export {
  _page as default
};
