import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs, applyToJob, withdrawApplication, getHRJobs, createJob, updateJob, deleteJob, getApplicants, updateAppStatus } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlinePlus, HiOutlineSearch, HiOutlineLocationMarker, HiOutlineClock, HiOutlineX, HiOutlineCheck, HiOutlineEye, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

const TYPE_COLORS = { internship:'#818cf8', 'full-time':'#34d399', 'part-time':'#fb923c', contract:'#f472b6', freelance:'#facc15' };
const STATUS_COLORS = { pending:'#64748b', reviewed:'#818cf8', shortlisted:'#34d399', rejected:'#f87171' };

const Badge = ({ text, color }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{text}</span>
);

/* ── Apply Modal ─────────────────────────────── */
const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [form, setForm] = useState({ coverLetter: '', resumeLink: '' });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try { await applyToJob(job._id, form); toast.success('Application sent!'); onSuccess(); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(99,102,241,0.3)', borderRadius:20, padding:28, width:'100%', maxWidth:480, animation:'fadeIn 0.2s ease' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:'white', fontWeight:700, fontSize:18 }}>Apply — {job.title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer' }}><HiOutlineX style={{ width:20, height:20 }} /></button>
        </div>
        <p style={{ color:'#64748b', fontSize:13, marginBottom:16 }}>at <strong style={{ color:'#a5b4fc' }}>{job.company}</strong></p>
        <div style={{ marginBottom:14 }}>
          <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:6 }}>Resume / Portfolio Link</label>
          <input className="input-field" placeholder="https://github.com/you or LinkedIn" value={form.resumeLink} onChange={e=>setForm(f=>({...f,resumeLink:e.target.value}))} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:6 }}>Cover Letter <span style={{ color:'#475569' }}>(optional)</span></label>
          <textarea className="input-field" rows={4} placeholder="Why are you a great fit?" style={{ resize:'none' }} value={form.coverLetter} onChange={e=>setForm(f=>({...f,coverLetter:e.target.value}))} maxLength={1000} />
          <p style={{ color:'#475569', fontSize:11, textAlign:'right', marginTop:2 }}>{form.coverLetter.length}/1000</p>
        </div>
        <button onClick={submit} disabled={loading} style={{ width:'100%', padding:'10px', borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#6366f1)', border:'none', color:'white', fontWeight:600, fontSize:14, cursor:'pointer' }}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
};

/* ── Post/Edit Job Modal (HR) ─────────────────── */
const JobFormModal = ({ job, onClose, onSuccess }) => {
  const empty = { title:'', company:'', location:'Remote', type:'internship', description:'', requirements:'', salary:'', skills:'', deadline:'' };
  const [form, setForm] = useState(job ? { ...job, skills: job.skills?.join(', ') || '', deadline: job.deadline ? job.deadline.slice(0,10) : '' } : empty);
  const [loading, setLoading] = useState(false);
  const s = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean), deadline: form.deadline || null };
      job ? await updateJob(job._id, payload) : await createJob(payload);
      toast.success(job ? 'Job updated!' : 'Job posted!');
      onSuccess(); onClose();
    } catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }} onClick={onClose}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(99,102,241,0.3)', borderRadius:20, padding:28, width:'100%', maxWidth:560, animation:'fadeIn 0.2s ease', margin:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:'white', fontWeight:700, fontSize:18 }}>{job ? 'Edit Job' : 'Post a New Job'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer' }}><HiOutlineX style={{ width:20, height:20 }} /></button>
        </div>
        {[['Job Title','title','e.g. Frontend Developer Intern'],['Company','company','Your company name'],['Location','location','Remote / Mumbai'],['Salary','salary','₹20,000/month or Unpaid']].map(([label,key,ph])=>(
          <div key={key} style={{ marginBottom:12 }}>
            <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>{label}</label>
            <input className="input-field" placeholder={ph} value={form[key]} onChange={e=>s(key,e.target.value)} />
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>Type</label>
            <select className="input-field" value={form.type} onChange={e=>s('type',e.target.value)}>
              {['internship','full-time','part-time','contract','freelance'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>Deadline</label>
            <input type="date" className="input-field" value={form.deadline} onChange={e=>s('deadline',e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>Skills Required <span style={{ color:'#475569' }}>(comma separated)</span></label>
          <input className="input-field" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e=>s('skills',e.target.value)} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>Job Description *</label>
          <textarea className="input-field" rows={4} style={{ resize:'none' }} maxLength={3000} value={form.description} onChange={e=>s('description',e.target.value)} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ color:'#94a3b8', fontSize:12, display:'block', marginBottom:5 }}>Requirements</label>
          <textarea className="input-field" rows={3} style={{ resize:'none' }} maxLength={2000} value={form.requirements} onChange={e=>s('requirements',e.target.value)} />
        </div>
        <button onClick={submit} disabled={loading} style={{ width:'100%', padding:'10px', borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#6366f1)', border:'none', color:'white', fontWeight:600, fontSize:14, cursor:'pointer' }}>
          {loading ? 'Saving…' : job ? 'Update Job' : 'Post Job'}
        </button>
      </div>
    </div>
  );
};

/* ── Applicants Drawer (HR) ───────────────────── */
const ApplicantsDrawer = ({ job, onClose }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getApplicants(job._id).then(r=>setApps(r.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  }, [job._id]);
  const changeStatus = async (appId, status) => {
    try { await updateAppStatus(job._id, appId, status); setApps(prev=>prev.map(a=>a._id===appId?{...a,status}:a)); toast.success('Status updated'); }
    catch { toast.error('Failed'); }
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', justifyContent:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:520, background:'#0f172a', borderLeft:'1px solid rgba(99,102,241,0.2)', height:'100%', overflowY:'auto', animation:'slideInRight 0.25s ease', padding:24 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ color:'white', fontWeight:700, fontSize:17 }}>Applicants</h2>
            <p style={{ color:'#64748b', fontSize:12 }}>{job.title} · {apps.length} applied</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:8, padding:6, cursor:'pointer', color:'#94a3b8' }}><HiOutlineX style={{ width:18, height:18 }} /></button>
        </div>
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>Loading…</div>
        : apps.length === 0 ? <div style={{ textAlign:'center', padding:60, color:'#64748b' }}><div style={{ fontSize:40, marginBottom:12 }}>📭</div><p>No applications yet</p></div>
        : apps.map(app => (
          <div key={app._id} style={{ background:'rgba(30,41,59,0.6)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:16, marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              {app.applicant?.avatar
                ? <img src={app.applicant.avatar} alt="" style={{ width:44, height:44, borderRadius:12, objectFit:'cover' }} />
                : <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:18 }}>{app.applicant?.name?.charAt(0)}</div>}
              <div style={{ flex:1 }}>
                <p style={{ color:'white', fontWeight:600, fontSize:14 }}>{app.applicant?.name}</p>
                <p style={{ color:'#64748b', fontSize:12 }}>{app.applicant?.email}</p>
                {app.applicant?.headline && <p style={{ color:'#818cf8', fontSize:11 }}>{app.applicant.headline}</p>}
              </div>
              <Badge text={app.status} color={STATUS_COLORS[app.status]} />
            </div>
            {app.applicant?.college && <p style={{ color:'#94a3b8', fontSize:12, marginBottom:6 }}>🎓 {app.applicant.college} · {app.applicant.branch} · {app.applicant.year}</p>}
            {app.applicant?.skills?.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>{app.applicant.skills.slice(0,6).map(s=><span key={s} style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:10, padding:'2px 8px', borderRadius:999 }}>{s}</span>)}</div>}
            {app.resumeLink && <a href={app.resumeLink} target="_blank" rel="noreferrer" style={{ color:'#818cf8', fontSize:12, display:'block', marginBottom:8 }}>🔗 View Resume / Portfolio</a>}
            {app.coverLetter && <p style={{ color:'#94a3b8', fontSize:12, fontStyle:'italic', marginBottom:10, borderLeft:'2px solid #334155', paddingLeft:10 }}>"{app.coverLetter}"</p>}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['pending','reviewed','shortlisted','rejected'].map(s=>(
                <button key={s} onClick={()=>changeStatus(app._id,s)} style={{ padding:'4px 10px', borderRadius:8, border:`1px solid ${STATUS_COLORS[s]}44`, background: app.status===s ? `${STATUS_COLORS[s]}22` : 'transparent', color: STATUS_COLORS[s], fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Job Card ─────────────────────────────────── */
const JobCard = ({ job, isHR, onApply, onWithdraw, onEdit, onDelete, onViewApplicants }) => {
  const deadline = job.deadline ? new Date(job.deadline) : null;
  const expired  = deadline && deadline < new Date();
  return (
    <div style={{ background:'rgba(15,23,42,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:20, transition:'all 0.2s', cursor:'default' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(99,102,241,0.3)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ color:'white', fontWeight:700, fontSize:16, marginBottom:4 }}>{job.title}</h3>
          <p style={{ color:'#818cf8', fontWeight:600, fontSize:13 }}>{job.company}</p>
        </div>
        <Badge text={job.type} color={TYPE_COLORS[job.type] || '#64748b'} />
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:12, fontSize:12, color:'#64748b' }}>
        <span><HiOutlineLocationMarker style={{ display:'inline', marginRight:4 }} />{job.location}</span>
        {job.salary && <span>💰 {job.salary}</span>}
        {deadline && <span style={{ color: expired ? '#f87171' : '#64748b' }}><HiOutlineClock style={{ display:'inline', marginRight:4 }} />{expired ? 'Expired' : `Closes ${deadline.toLocaleDateString()}`}</span>}
        {isHR && <span style={{ color:'#818cf8' }}>👥 {job.applicantCount ?? job.applications?.length ?? 0} applicants</span>}
      </div>
      {job.skills?.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>{job.skills.map(s=><span key={s} style={{ background:'rgba(99,102,241,0.12)', color:'#a5b4fc', fontSize:11, padding:'2px 8px', borderRadius:999 }}>{s}</span>)}</div>}
      <p style={{ color:'#94a3b8', fontSize:13, lineHeight:1.6, marginBottom:14 }}>{job.description.slice(0,160)}{job.description.length>160?'…':''}</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {isHR ? (<>
          <button onClick={()=>onViewApplicants(job)} style={{ flex:1, padding:'8px', borderRadius:10, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><HiOutlineEye style={{ width:14,height:14 }} />Applicants</button>
          <button onClick={()=>onEdit(job)} style={{ padding:'8px 12px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:12, cursor:'pointer' }}><HiOutlinePencil style={{ width:14,height:14 }} /></button>
          <button onClick={()=>onDelete(job._id)} style={{ padding:'8px 12px', borderRadius:10, background:'transparent', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', fontSize:12, cursor:'pointer' }}><HiOutlineTrash style={{ width:14,height:14 }} /></button>
        </>) : job.hasApplied ? (<>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:10, background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.35)', color:'#34d399', fontSize:12, fontWeight:700 }}><HiOutlineCheck style={{ width:14, height:14 }} /> Applied</span>
          <button onClick={()=>onWithdraw(job._id)} style={{ padding:'8px 14px', borderRadius:10, background:'transparent', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171', fontSize:12, fontWeight:500, cursor:'pointer' }}>Withdraw</button>
        </>) : (
          <button onClick={()=>onApply(job)} disabled={expired||!job.isActive} style={{ padding:'8px 18px', borderRadius:10, background: expired||!job.isActive ? 'rgba(51,65,85,0.5)' : 'linear-gradient(135deg,#4f46e5,#6366f1)', border:'none', color:'white', fontSize:12, fontWeight:600, cursor: expired||!job.isActive ? 'not-allowed' : 'pointer' }}>{expired ? 'Expired' : !job.isActive ? 'Closed' : 'Apply Now'}</button>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────── */
export default function Jobs() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';

  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [applyJob, setApplyJob]       = useState(null);
  const [formJob, setFormJob]         = useState(null);  // null=closed, {}=new, job=edit
  const [viewApps, setViewApps]       = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = isHR ? await getHRJobs() : await getJobs({ q: search, type: typeFilter });
      setJobs(isHR ? data : data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [isHR, search, typeFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleWithdraw = async (id) => {
    try { await withdrawApplication(id); toast.success('Application withdrawn'); fetchJobs(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try { await deleteJob(id); toast.success('Job deleted'); fetchJobs(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ padding:'2rem', maxWidth:860, margin:'0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'white', marginBottom:4 }}>
            {isHR ? '💼 My Job Postings' : '🎯 Job Board'}
          </h1>
          <p style={{ color:'#64748b', fontSize:14 }}>{isHR ? 'Manage your listings and review applicants' : 'Find internships & jobs — apply in one click'}</p>
        </div>
        {isHR && (
          <button onClick={()=>setFormJob({})} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#6366f1)', border:'none', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }}>
            <HiOutlinePlus style={{ width:16,height:16 }} /> Post Job
          </button>
        )}
      </div>

      {/* Filters (students only) */}
      {!isHR && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <HiOutlineSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#64748b', width:16, height:16 }} />
            <input className="input-field" style={{ paddingLeft:38 }} placeholder="Search jobs, skills, companies…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="input-field" style={{ width:'auto', minWidth:140 }} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {['internship','full-time','part-time','contract','freelance'].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))' }}>
          {[1,2,3].map(i=><div key={i} style={{ background:'rgba(30,41,59,0.4)', borderRadius:18, height:200, animation:'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem 0' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>💼</div>
          <p style={{ color:'white', fontWeight:600, fontSize:18, marginBottom:8 }}>{isHR ? 'No jobs posted yet' : 'No jobs found'}</p>
          <p style={{ color:'#64748b', fontSize:14 }}>{isHR ? 'Click "Post Job" to create your first listing' : 'Try different keywords or check back later'}</p>
        </div>
      ) : (
        <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))' }}>
          {jobs.map(job=>(
            <JobCard key={job._id} job={job} isHR={isHR}
              onApply={setApplyJob} onWithdraw={handleWithdraw}
              onEdit={j=>setFormJob(j)} onDelete={handleDelete}
              onViewApplicants={setViewApps} />
          ))}
        </div>
      )}

      {/* Modals */}
      {applyJob  && <ApplyModal  job={applyJob}  onClose={()=>setApplyJob(null)}  onSuccess={fetchJobs} />}
      {formJob !== null && <JobFormModal job={Object.keys(formJob).length?formJob:null} onClose={()=>setFormJob(null)} onSuccess={fetchJobs} />}
      {viewApps  && <ApplicantsDrawer job={viewApps} onClose={()=>setViewApps(null)} />}
    </div>
  );
}
