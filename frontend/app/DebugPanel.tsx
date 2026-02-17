'use client';

import { useState } from 'react';
import { getSupabase } from '../lib/contact-queries';

interface ContactRecord {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  form_submitted_at: string | null;
  call_booked_at: string | null;
  is_qualified: boolean | null;
  showed_up_at: string | null;
  deal_closed_at: string | null;
  created_at: string;
}

interface AdRecord {
  id: string;
  ad_id: string;
  ad_name: string | null;
  campaign_name: string | null;
  date: string;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();

      console.log("🔬 [DebugPanel] Fetching raw data from Supabase...");

      // Fetch all contacts (limit to 50 for performance)
      const { data: contactsData, error: contactsError, count: contactsCount } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, form_submitted_at, call_booked_at, is_qualified, showed_up_at, deal_closed_at, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      if (contactsError) {
        console.error("❌ [DebugPanel] Contacts error:", contactsError);
        setError(`Contacts error: ${contactsError.message}`);
      }

      console.log("📊 [DebugPanel] Contacts fetched:", {
        count: contactsCount,
        returned: contactsData?.length || 0,
        sample: contactsData?.slice(0, 3)
      });

      // Fetch all ads (limit to 50)
      const { data: adsData, error: adsError, count: adsCount } = await supabase
        .from('ads')
        .select('id, ad_id, ad_name, campaign_name, date, spend, impressions, clicks', { count: 'exact' })
        .order('date', { ascending: false })
        .limit(50);

      if (adsError) {
        console.error("❌ [DebugPanel] Ads error:", adsError);
        setError(`Ads error: ${adsError.message}`);
      }

      console.log("📊 [DebugPanel] Ads fetched:", {
        count: adsCount,
        returned: adsData?.length || 0,
        sample: adsData?.slice(0, 3)
      });

      setContacts(contactsData || []);
      setAds(adsData || []);

    } catch (err) {
      console.error("❌ [DebugPanel] Error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchDebugData();
  };

  const formatTimestamp = (ts: string | null): string => {
    if (!ts) return 'N/A';
    const date = new Date(ts);
    return date.toLocaleString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 z-50 flex items-center gap-2"
      >
        <span>Debug Database</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">Database Debug Panel</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchDebugData}
              className="bg-purple-500 hover:bg-purple-400 px-3 py-1 rounded text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              x
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading database data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contacts Section */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Contacts Table ({contacts.length} records shown)
                </h3>
                {contacts.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    No contacts found in database. The webhook may not be writing data.
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">ID</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Form Submitted</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Call Booked</th>
                          <th className="border-b px-3 py-2 text-center font-semibold text-gray-700">Qualified</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Showed</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Closed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600 font-mono text-xs">{contact.id.slice(0, 8)}...</td>
                            <td className="px-3 py-2 text-gray-900">{contact.first_name} {contact.last_name}</td>
                            <td className="px-3 py-2 text-gray-600">{contact.email || 'N/A'}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{formatTimestamp(contact.form_submitted_at)}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{formatTimestamp(contact.call_booked_at)}</td>
                            <td className="px-3 py-2 text-center">
                              {contact.is_qualified === true ? (
                                <span className="text-green-600 font-bold">Yes</span>
                              ) : contact.is_qualified === false ? (
                                <span className="text-red-600 font-bold">No</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{formatTimestamp(contact.showed_up_at)}</td>
                            <td className="px-3 py-2 text-gray-600 text-xs">{formatTimestamp(contact.deal_closed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ads Section */}
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Ads Table ({ads.length} records shown)
                </h3>
                {ads.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    No ads found in database. The Facebook sync may not have run.
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Ad Name</th>
                          <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">Campaign</th>
                          <th className="border-b px-3 py-2 text-right font-semibold text-gray-700">Spend</th>
                          <th className="border-b px-3 py-2 text-right font-semibold text-gray-700">Impressions</th>
                          <th className="border-b px-3 py-2 text-right font-semibold text-gray-700">Clicks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ads.map((ad, idx) => (
                          <tr key={`${ad.id}-${idx}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900 font-medium">{ad.date}</td>
                            <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate" title={ad.ad_name || undefined}>
                              {ad.ad_name || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate" title={ad.campaign_name || undefined}>
                              {ad.campaign_name || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900 font-medium">
                              ${(ad.spend || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {(ad.impressions || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {(ad.clicks || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Total Contacts: <span className="font-semibold">{contacts.length}</span></li>
                  <li>Contacts with form_submitted_at: <span className="font-semibold">{contacts.filter(c => c.form_submitted_at).length}</span></li>
                  <li>Contacts with call_booked_at: <span className="font-semibold">{contacts.filter(c => c.call_booked_at).length}</span></li>
                  <li>Qualified contacts: <span className="font-semibold">{contacts.filter(c => c.is_qualified === true).length}</span></li>
                  <li>Total Ads Records: <span className="font-semibold">{ads.length}</span></li>
                  <li>Total Spend: <span className="font-semibold">${ads.reduce((sum, a) => sum + (a.spend || 0), 0).toFixed(2)}</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
