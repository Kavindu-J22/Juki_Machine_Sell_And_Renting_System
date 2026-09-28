import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { rentalService } from '../services/rentalService';
import {
  FileText,
  Printer,
  Loader2,
  Building2,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Send
} from 'lucide-react';

const DocumentsPage = () => {
  const [docType, setDocType] = useState('Agreement'); // 'Agreement' | 'Delivery' | 'Quotation' | 'Return'
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [documentData, setDocumentData] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Quotation form state
  const [quotationCustomerName, setQuotationCustomerName] = useState('');
  const [quotationCustomerPhone, setQuotationCustomerPhone] = useState('');
  const [quotationItems, setQuotationItems] = useState([
    { description: 'Juki Single Needle Lockstitch Sewing Machine (DDL-8700)', qty: 1, rate: 25000, amount: 25000 }
  ]);

  useEffect(() => {
    loadRentalsList();
  }, []);

  const loadRentalsList = async () => {
    try {
      const res = await rentalService.getRentals();
      if (res.success && res.data.length > 0) {
        setRentals(res.data);
        setSelectedRentalId(res.data[0]._id);
        fetchDocument(docType, res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching rentals for documents:', err);
    }
  };

  const fetchDocument = async (type, rentalId) => {
    try {
      setLoadingDoc(true);
      let res;
      if (type === 'Agreement' && rentalId) {
        res = await documentService.getAgreementDocument(rentalId);
      } else if (type === 'Delivery' && rentalId) {
        res = await documentService.getDeliveryNote(rentalId);
      } else if (type === 'Return' && rentalId) {
        res = await documentService.getReturnNote(rentalId);
      } else if (type === 'Quotation') {
        res = await documentService.getQuotation({
          customerName: quotationCustomerName,
          customerPhone: quotationCustomerPhone,
          items: quotationItems,
          validDays: 14
        });
      }
      if (res && res.success) {
        setDocumentData(res.data);
      }
    } catch (err) {
      console.error('Error loading document payload:', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDocTypeChange = (newType) => {
    setDocType(newType);
    if (newType !== 'Quotation' && selectedRentalId) {
      fetchDocument(newType, selectedRentalId);
    } else if (newType === 'Quotation') {
      fetchDocument('Quotation', null);
    }
  };

  const handleRentalSelectChange = (rentalId) => {
    setSelectedRentalId(rentalId);
    fetchDocument(docType, rentalId);
  };

  const handleAddQuotationItem = () => {
    setQuotationItems([
      ...quotationItems,
      { description: 'Juki Overlock Sewing Machine (MO-6800)', qty: 1, rate: 30000, amount: 30000 }
    ]);
  };

  const handleQuotationItemChange = (index, field, val) => {
    const updated = [...quotationItems];
    updated[index][field] = field === 'qty' || field === 'rate' ? Number(val) : val;
    updated[index].amount = updated[index].qty * updated[index].rate;
    setQuotationItems(updated);
  };

  const handleRemoveQuotationItem = (index) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <FileText className="text-indigo-400" />
            <span>Dynamic Document & Printable Generator</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate printable Agreement Sheets, Delivery Notes, Quotations, and Return Receipts with official company details.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <Printer size={16} />
          <span>Print Document</span>
        </button>
      </div>

      {/* Document Selector Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 no-print">
        <div className="flex flex-wrap gap-2">
          {['Agreement', 'Delivery', 'Quotation', 'Return'].map((t) => (
            <button
              key={t}
              onClick={() => handleDocTypeChange(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                docType === t
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t === 'Agreement' && '📄 Rental Agreement Sheet'}
              {t === 'Delivery' && '🚚 Delivery Note'}
              {t === 'Quotation' && '📊 Rental Quotation'}
              {t === 'Return' && '🔄 Machine Return Receipt'}
            </button>
          ))}
        </div>

        {/* Contract Selector for Agreement, Delivery & Return */}
        {docType !== 'Quotation' && (
          <div className="max-w-md">
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
              Select Rental Contract Payload
            </label>
            <select
              value={selectedRentalId}
              onChange={(e) => handleRentalSelectChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs"
            >
              {rentals.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.rentalId} - {r.customer?.name} ({r.machines?.length} Machines)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quotation Editor */}
        {docType === 'Quotation' && (
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Client Name (e.g. Brandix Factory)"
                value={quotationCustomerName}
                onChange={(e) => setQuotationCustomerName(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                placeholder="Client Phone (e.g. +94 77 123 4567)"
                value={quotationCustomerPhone}
                onChange={(e) => setQuotationCustomerPhone(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Quotation Machine Items</span>
              {quotationItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleQuotationItemChange(idx, 'description', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleQuotationItemChange(idx, 'qty', e.target.value)}
                    className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-center"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleQuotationItemChange(idx, 'rate', e.target.value)}
                    className="w-28 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuotationItem(idx)}
                    className="text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuotationItem}
                className="text-xs text-indigo-400 font-semibold flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <button
              onClick={() => fetchDocument('Quotation', null)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Generate Quotation Preview
            </button>
          </div>
        )}
      </div>

      {/* PRINTABLE DOCUMENT VIEW CONTAINER */}
      {loadingDoc ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : documentData ? (
        <div
          id="printable-area"
          className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200 space-y-8 max-w-4xl mx-auto font-sans"
        >
          {/* Document Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {documentData.company.companyName}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                {documentData.company.address}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Phone: {documentData.company.phone} | Email: {documentData.company.email}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                BR No: {documentData.company.registrationNumber} | TIN: {documentData.company.taxDetails?.taxId}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-sm rounded border border-slate-300 uppercase tracking-wider">
                {docType === 'Agreement' && 'RENTAL AGREEMENT'}
                {docType === 'Delivery' && 'DELIVERY NOTE'}
                {docType === 'Quotation' && 'FORMAL QUOTATION'}
                {docType === 'Return' && 'RETURN RECEIPT'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                Ref: {documentData.rental?.rentalId || documentData.quotationNo || documentData.deliveryNoteId || documentData.returnNoteId}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(documentData.generatedAt || documentData.issueDate || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Customer & Party Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Client Details</span>
              <p className="font-bold text-sm text-slate-900 mt-1">
                {documentData.customer?.name || documentData.customerName || 'Valued Client'}
              </p>
              <p className="text-slate-600 mt-0.5">
                Phone: {documentData.customer?.phone || documentData.customerPhone}
              </p>
              {documentData.customer?.nic && (
                <p className="text-slate-600">NIC / Reg: {documentData.customer.nic}</p>
              )}
              {documentData.customer?.address && (
                <p className="text-slate-600 truncate">{documentData.customer.address}</p>
              )}
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px]">Contract Metadata</span>
              {documentData.rental && (
                <>
                  <p className="text-slate-700 mt-1">Start Date: <strong>{new Date(documentData.rental.startDate).toLocaleDateString()}</strong></p>
                  <p className="text-slate-700">Due Date: <strong>{new Date(documentData.rental.dueDate).toLocaleDateString()}</strong></p>
                  <p className="text-slate-700">Monthly Rate: <strong>LKR {documentData.rental.monthlyRentAmount?.toLocaleString()}</strong></p>
                  <p className="text-slate-700">Deposit: <strong>LKR {documentData.rental.depositAmount?.toLocaleString()}</strong></p>
                </>
              )}
              {docType === 'Quotation' && (
                <p className="text-slate-700 mt-1">Valid Until: <strong>{new Date(documentData.validUntil).toLocaleDateString()}</strong></p>
              )}
            </div>
          </div>

          {/* Equipment Items Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Equipment & Machine Specifications
            </h3>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold">Serial Number</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Rate / Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documentData.machines?.map((mac) => (
                  <tr key={mac._id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {mac.brand} {mac.model} Sewing Machine
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{mac.serialNumber}</td>
                    <td className="py-2.5 px-3 text-center">1 Unit</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      LKR {(documentData.rental?.monthlyRentAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {documentData.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-2.5 px-3 text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-center">{item.qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      LKR {(item.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms & Bank Details */}
          <div className="border-t border-slate-300 pt-4 grid grid-cols-2 gap-6 text-[11px] text-slate-600">
            <div>
              <span className="font-bold text-slate-800 uppercase block mb-1">Terms & Conditions</span>
              <p className="whitespace-pre-line leading-relaxed">
                {documentData.company.agreementTerms}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-800 uppercase block mb-1">Official Remittance Bank Details</span>
              <p>Bank: <strong>{documentData.company.bankDetails?.bankName}</strong></p>
              <p>Branch: {documentData.company.bankDetails?.branch}</p>
              <p>Acc No: <strong>{documentData.company.bankDetails?.accountNumber}</strong></p>
              <p>Acc Name: {documentData.company.bankDetails?.accountName}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-12 border-t border-slate-300 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Authorized Officer Signature</p>
              <p className="text-[10px] text-slate-500">Juki Sewing Machine Centre</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Customer Acceptance Signature</p>
              <p className="text-[10px] text-slate-500">Seal & Date</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DocumentsPage;
