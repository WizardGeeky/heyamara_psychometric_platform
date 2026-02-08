
'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateAnalysis, AssessmentResult } from '@/lib/psychometric-engine';
import { RadarChartComponent } from '@/components/Results/RadarChart';
import {
    Trophy,
    AlertTriangle,
    Briefcase,
    Lightbulb,
    Activity,
    ArrowLeft,
    Download,
    Share2,
    Mail,
    CheckCircle2,
    ExternalLink,
    ShieldCheck,
    Zap,
    BrainCircuit,
    Timer
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Exceptional';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Proficient';
    if (score >= 50) return 'Moderate';
    if (score >= 40) return 'Developing';
    return 'Emerging';
}

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStage, setLoadingStage] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const stages = [
        "Initializing Neural Synthesis...",
        "Crunching Dimensional Data...",
        "Identifying Behavioral Fingerprints...",
        "Synthesizing Strategic Insights...",
        "Generating Hiring Intelligence..."
    ];

    useEffect(() => {
        let stageInterval: any;
        if (loading) {
            stageInterval = setInterval(() => {
                setLoadingStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
            }, 800);
        }
        return () => clearInterval(stageInterval);
    }, [loading]);

    useEffect(() => {
        const fetchResults = async () => {
            const userParam = searchParams.get('u');

            if (userParam) {
                try {
                    const res = await fetch(`/api/user?email=${encodeURIComponent(userParam)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUserEmail(data.email);
                        const analysis = generateAnalysis(data.scores);
                        analysis.responses = data.responses;
                        setTimeout(() => {
                            setResult(analysis);
                            setLoading(false);
                        }, 4000); // Artificial delay for "real-time" feel
                        return;
                    }
                } catch (e) {
                    console.error("Failed to fetch shared results", e);
                }
            }

            const localData = localStorage.getItem('hey_amara_results');
            if (!localData) {
                router.push('/test');
                return;
            }

            try {
                const parsed = JSON.parse(localData);
                setUserEmail(parsed.email || 'Candidate');
                const analysis = generateAnalysis(parsed.scores);
                analysis.responses = parsed.responses;
                setTimeout(() => {
                    setResult(analysis);
                    setLoading(false);
                }, 4000); // Artificial delay for "real-time" feel
            } catch (e) {
                console.error("Failed to parse local results", e);
                router.push('/test');
            }
        };

        fetchResults();
    }, [router, searchParams]);

    const handleExportPDF = async () => {
        if (!result) return;
        setIsExporting(true);

        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            const pdf = new jsPDF('p', 'mm', 'a4', true) as any;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const shareUrl = `${window.location.origin}/results?u=${encodeURIComponent(userEmail)}`;

            // 1. Professional Heading
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.setTextColor(100, 103, 242); // Primary Purple
            pdf.text('Assessment Discovery Result', 20, 25);

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 116, 139); // Slate-400
            pdf.text(`CANDIDATE: ${userEmail.toUpperCase()}`, 20, 32);
            pdf.text(`REPORT DATA: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 37);

            // 2. Data Table
            const tableData = result.questions.map(q => [
                q.dimension.toUpperCase(),
                q.text,
                result.responses ? result.responses[q.id]?.toString() || '3' : '3'
            ]);

            autoTable(pdf, {
                startY: 45,
                head: [['Dimension', 'Evaluation Criteria', 'Impact Score [1-5]']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [100, 103, 242], textColor: 255, fontSize: 10, cellPadding: 5 },
                bodyStyles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
                columnStyles: {
                    0: { cellWidth: 35, fontStyle: 'bold' },
                    2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
                },
                margin: { left: 20, right: 20 },
                didDrawPage: (data: any) => {
                    // Footer on every page
                    pdf.setFontSize(8);
                    pdf.setTextColor(148, 163, 184); // slate-400
                    const pageHeight = pdf.internal.pageSize.height;

                    pdf.text('Contact Us: support@heyamara.ai', 20, pageHeight - 15);
                    pdf.text('Full Result Link:', 20, pageHeight - 10);
                    pdf.setTextColor(100, 103, 242);
                    pdf.text(shareUrl, 42, pageHeight - 10);

                    pdf.setTextColor(148, 163, 184);
                    pdf.text(`Page ${data.pageNumber} | HeyAmara Assessment Data`, pdfWidth - 75, pageHeight - 10);
                }
            });

            pdf.save(`HeyAmara_Result_${userEmail.split('@')[0]}.pdf`);
        } catch (err) {
            console.error("Focused PDF Export Failure:", err);
            alert("Export failed. Please check your data and try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?u=${encodeURIComponent(userEmail)}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (loading || !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] modern-grid p-6 relative">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
                </div>

                <div className="max-w-md w-full space-y-10 text-center relative z-10">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 border-[6px] border-primary/5 border-t-primary rounded-[3rem] animate-spin mx-auto" />
                        <div className="absolute inset-0 flex items-center justify-center text-primary">
                            <BrainCircuit className="animate-pulse" size={32} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                            <Timer size={12} />
                            Calculating Metrics
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Synthesizing Intelligence
                        </h2>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
                            />
                        </div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest h-6">
                            {stages[loadingStage]}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        {['Pattern Matching', 'Bias Filtering', 'Trait Mapping', 'Signal Extraction'].map((task, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                <div className={`w-1.5 h-1.5 rounded-full ${i <= loadingStage ? 'bg-accent shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-200'}`} />
                                {task}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] modern-grid selection:bg-primary selection:text-white relative">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#6467f2]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2bd4bd]/5 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Analysis Status Bar */}
            <div className="bg-slate-900 text-white py-2 px-6 text-[9px] font-black uppercase tracking-[0.3em] flex justify-between items-center sticky top-0 z-[60] no-print">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                        Live Profile Verified
                    </span>
                    <span className="text-white/30 truncate max-w-[100px] md:max-w-none">HASH: {(userEmail + 'salt').slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <span>Engine v4.2.0</span>
                    <span className="text-white/30">UTC: {new Date().toISOString().slice(11, 19)}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16" ref={reportRef} id="report-content">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-10">

                        {/* Header Section */}
                        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-2xl shadow-primary/5 border-white/60 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[11px]">
                                        <ShieldCheck size={16} />
                                        Certified Assessment
                                    </div>
                                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-[-0.05em] leading-[0.85]">
                                        Talent <br />
                                        <span className="gradient-text italic text-4xl md:text-7xl">Intelligence.</span>
                                    </h1>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-4 border-t border-slate-100 text-slate-400 font-bold text-sm">
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <Mail size={16} className="text-primary" />
                                            {userEmail}
                                        </div>
                                        <div className="hidden sm:block h-4 w-[1px] bg-slate-200" />
                                        <span>Issue: {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto no-print">
                                    <button
                                        onClick={handleExportPDF}
                                        disabled={isExporting}
                                        className="btn-primary py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 border-0"
                                    >
                                        {isExporting ? 'Generating...' : <><Download size={20} /> PDF Report</>}
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="btn-outline py-4 px-8 rounded-2xl flex items-center justify-center gap-3 bg-white no-print"
                                    >
                                        {isCopied ? 'Link Copied' : <><Share2 size={20} /> Share</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Visual Dimensions */}
                            <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-primary/5 border-white/60 flex flex-col justify-center min-h-[400px] md:min-h-[500px]">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                    <Activity size={16} className="text-primary" />
                                    Radial Mapping
                                </h3>
                                <div className="flex-1 flex items-center justify-center">
                                    <RadarChartComponent scores={result.scores} />
                                </div>
                            </div>

                            {/* Traits Content */}
                            <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-primary/5 border-white/60 space-y-8">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                    <BrainCircuit size={16} className="text-accent" />
                                    Dimensional Traits
                                </h3>
                                {Object.entries(result.traits).map(([key, trait]) => (
                                    <div key={key} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest">
                                                    {result.scores[key as keyof typeof result.scores]}% • {getScoreLabel(result.scores[key as keyof typeof result.scores])}
                                                </span>
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{key} Style</span>
                                            </div>
                                            <span className={`trait-badge trait-badge-${trait.level.toLowerCase()}`}>
                                                {trait.label}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                style={{ width: `${result.scores[key as keyof typeof result.scores]}%` }}
                                            />
                                        </div>
                                        <p className="mt-3 text-xs text-slate-500 font-medium leading-relaxed italic">
                                            {trait.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strategic Interpretation Section */}
                        <div className="bg-secondary/40 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                            <Lightbulb size={120} className="absolute -right-10 -bottom-10 text-primary/5 -rotate-12" />
                            <div className="relative z-10">
                                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                    <Lightbulb size={24} className="text-accent" />
                                    Strategic Synthesis
                                </h2>
                                <p className="text-xl md:text-3xl font-black text-slate-800 leading-tight mb-8 md:mb-12">
                                    "{result.interpretation}"
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-200">
                                    <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-white space-y-4">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                            <Trophy size={14} /> Competitive Edge
                                        </h4>
                                        <ul className="space-y-3">
                                            {result.strengths.map((s, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-bold text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-white space-y-4">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
                                            <AlertTriangle size={14} /> Critical Blindspots
                                        </h4>
                                        <ul className="space-y-3">
                                            {result.risks.map((r, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-bold text-slate-600 opacity-80">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Breakdown Table */}
                        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-primary/5 border-white/60">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <ShieldCheck size={16} className="text-primary" />
                                Raw Dimensions & Responses
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="results-table w-full">
                                    <thead>
                                        <tr>
                                            <th>Dimension</th>
                                            <th>Question Context</th>
                                            <th className="text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.questions.map((q) => (
                                            <tr key={q.id}>
                                                <td className="font-bold text-primary uppercase text-[10px] tracking-wider whitespace-nowrap">
                                                    {q.dimension}
                                                </td>
                                                <td className="text-sm font-medium text-slate-600 max-w-md">
                                                    {q.text}
                                                </td>
                                                <td className="text-right font-black text-slate-900 score-cell">
                                                    {result.responses ? result.responses[q.id] : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={2} className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">
                                                Normalized Aggregate Impact
                                            </td>
                                            <td className="text-right font-black text-primary text-lg">
                                                {result.cultureAlignment}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:w-[400px] space-y-8">
                        {/* Hiring Signal Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                            <Zap size={140} className="absolute -right-10 -top-10 text-white/5 opacity-40 rotate-12" />
                            <div className="relative z-10 space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    <Zap size={12} fill="currentColor" className="text-accent" />
                                    Hiring Signal
                                </div>

                                <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <p className="text-lg font-black leading-tight">
                                        "{result.hiringSignal}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Culture Alignment</p>
                                        <p className="text-2xl font-black italic">{result.cultureAlignment}%</p>
                                    </div>
                                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000"
                                            style={{ width: `${result.cultureAlignment}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Best Fit Roles */}
                        <div className="glass-card rounded-[3rem] p-8 shadow-2xl shadow-primary/5 border-white/60">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Role Archetypes</h3>
                            <div className="space-y-3">
                                {result.bestFitRoles.map((role, i) => (
                                    <div key={i} className="group p-4 bg-slate-50 hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 flex justify-between items-center cursor-default">
                                        <span className="text-sm font-black">{role}</span>
                                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </main>

            {/* Custom Styles for Printing and PDF */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                }
                .gradient-text {
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
