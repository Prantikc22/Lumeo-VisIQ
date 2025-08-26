// SDKsIntegrationsStrip: brutal section with SDK badges, code snippets, and integrations
import React from "react";

export const SDKsIntegrationsStrip: React.FC = () => (
  <section className="py-16 px-4 max-w-6xl mx-auto">
    <h2 className="text-2xl font-black mb-8 text-center">SDKs & Integrations</h2>
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">JavaScript</span>
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">Python</span>
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">Node</span>
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">iOS</span>
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">Android</span>
      <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-bold border-none shadow-none">Webhooks</span>
    </div>
    <div className="flex flex-col md:flex-row gap-8 justify-center">
      <div className="bg-gray-50 rounded-xl p-6 flex-1 min-w-[320px] border border-teal-50">
        <div className="font-bold text-lg mb-2">Quickstart (JS)</div>
        <pre className="bg-gray-100 p-4 rounded-xl text-xs text-left overflow-x-auto border border-black">
{`import VisitorIQ from 'visitoriQ';

const vq = new VisitorIQ({ apiKey: 'YOUR_KEY' });
const id = await vq.getVisitorId();
console.log(id);`}
        </pre>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 flex-1 min-w-[320px] border border-teal-50">
        <div className="font-bold text-lg mb-2">Integrations</div>
        <ul className="list-disc pl-5 text-left">
          <li>Zapier</li>
          <li>Segment</li>
          <li>Google Tag Manager</li>
          <li>Shopify</li>
          <li>Custom API</li>
        </ul>
      </div>
    </div>
  </section>
);
