import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Search, Plus, Clock, ArrowRight, Sparkles, Star, MoreHorizontal,
  LayoutTemplate, Folder
} from 'lucide-react'
import { useOrgBranding } from '../contexts/OrgBrandingContext'
import DashboardCard from '../components/DashboardCard'
import EmptyState from '../components/EmptyState'
import SkeletonLoader from '../components/SkeletonLoader'
import SeoHead from "../../components/SeoHead"
import type { EventTemplate } from '../types'
import type { EventType } from '../types'
import { orgService } from '../../services/org-service'
import { useApiResource } from '../../hooks/useApiResource'

type CategoryFilter = 'all' | 'default' | 'organization' | 'recent'

const TYPE_LABELS: Record<EventType, string> = {
  governance_election: 'Governance Election', award_competition: 'Award Competition', poll: 'Poll',
  survey: 'Survey', referendum: 'Referendum', agm: 'AGM', recruitment: 'Recruitment',
  general_meeting: 'General Meeting', custom: 'Custom',
}

export default function OrgTemplates() {
  const { branding } = useOrgBranding()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const { data, loading, error, reload } = useApiResource(async () => {
    const result = await orgService.getTemplates({ perPage: 100 })
    return result.items
  })

  const MOCK_TEMPLATES = data ?? []

  if (loading) {
    return (
      <>
        <SeoHead meta={{ title: 'Templates — Organization | ORIVIS', noindex: true }} />
        <div className="space-y-6">
          <div className="animate-pulse h-10 w-64 bg-brand-surface-elevated rounded-2xl" />
          <SkeletonLoader rows={4} variant="card" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SeoHead meta={{ title: 'Templates — Organization | ORIVIS', noindex: true }} />
        <EmptyState
          icon={LayoutTemplate}
          title="Failed to load templates"
          description={error}
          action={{ label: 'Retry', onClick: reload }}
        />
      </>
    )
  }

  const filtered = useMemo(() => {
    let result = [...MOCK_TEMPLATES]
    if (categoryFilter !== 'all') result = result.filter((t) => t.category === categoryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    return result
  }, [categoryFilter, search, MOCK_TEMPLATES])

  const recentTemplates = useMemo(() =>
    MOCK_TEMPLATES.filter((t) => t.category === 'recent').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [MOCK_TEMPLATES])
  const defaultTemplates = useMemo(() =>
    MOCK_TEMPLATES.filter((t) => t.category === 'default').sort((a, b) => b.usedCount - a.usedCount), [MOCK_TEMPLATES])
  const orgTemplates = useMemo(() =>
    MOCK_TEMPLATES.filter((t) => t.category === 'organization').sort((a, b) => b.usedCount - a.usedCount), [MOCK_TEMPLATES])

  const [previewing, setPreviewing] = useState<string | null>(null)

  const handleUseTemplate = (template: EventTemplate) => {
    console.log('Use template:', template.id)
  }

  const handleSaveAsTemplate = () => {
    console.log('Save current event as template')
  }

  return (
    <>
      <SeoHead meta={{ title: 'Templates — Organization | ORIVIS', noindex: true }} />
      <div className="space-y-6 max-w-[1440px] mx-auto pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-display font-bold uppercase tracking-tight text-brand-text-primary">
              Event Templates
            </h1>
            <p className="text-[10px] font-mono text-brand-text-muted mt-0.5">
              Start from a template or save your current event as one
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSaveAsTemplate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all shadow-md"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Plus size={14} /> Save as Template
          </motion.button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard>
            <p className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">Total Templates</p>
            <p className="text-2xl font-bold font-mono text-brand-text-primary mt-1">{MOCK_TEMPLATES.length}</p>
          </DashboardCard>
          <DashboardCard>
            <p className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">Most Used</p>
            <p className="text-2xl font-bold font-mono text-brand-text-primary mt-1">{defaultTemplates[0]?.usedCount ?? 0}x</p>
          </DashboardCard>
          <DashboardCard>
            <p className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">Organization</p>
            <p className="text-2xl font-bold font-mono text-brand-text-primary mt-1">{orgTemplates.length}</p>
          </DashboardCard>
          <DashboardCard>
            <p className="text-[10px] font-mono text-status-success uppercase tracking-wider">Recent</p>
            <p className="text-2xl font-bold font-mono text-brand-text-primary mt-1">{recentTemplates.length}</p>
          </DashboardCard>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-brand-surface border border-brand-border text-brand-text-primary placeholder:text-brand-text-disabled focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': branding.primaryColor } as React.CSSProperties}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(['all', 'default', 'organization', 'recent'] as CategoryFilter[]).map((cat) => {
            const count = cat === 'all' ? MOCK_TEMPLATES.length : MOCK_TEMPLATES.filter((t) => t.category === cat).length
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[var(--org-primary)]/10 text-[var(--org-primary)] border border-[var(--org-primary)]/20'
                    : 'bg-brand-surface border border-brand-border text-brand-text-muted hover:text-brand-text-primary hover:border-brand-text-muted/30'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${isActive ? 'bg-[var(--org-primary)]/20' : 'bg-brand-surface-elevated text-brand-text-disabled'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {recentTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-brand-gold" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-primary">Recent Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTemplates.map((tmpl) => (
                <TemplateCard key={tmpl.id} template={tmpl} onUse={handleUseTemplate} onPreview={setPreviewing} branding={branding} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-brand-gold" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-primary">Default Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((tmpl) => (
              <TemplateCard key={tmpl.id} template={tmpl} onUse={handleUseTemplate} onPreview={setPreviewing} branding={branding} />
            ))}
          </div>
          {defaultTemplates.length === 0 && (
            <EmptyState icon={LayoutTemplate} title="No Default Templates" description="Default templates will appear here." />
          )}
        </div>

        {orgTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Folder size={14} className="text-brand-gold" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text-primary">Organization Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgTemplates.map((tmpl) => (
                <TemplateCard key={tmpl.id} template={tmpl} onUse={handleUseTemplate} onPreview={setPreviewing} branding={branding} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && !recentTemplates.length && (
          <EmptyState
            icon={LayoutTemplate}
            title="No Templates Found"
            description={search ? 'Try a different search term.' : 'No templates match the selected filter.'}
          />
        )}
      </div>
    </>
  )
}

function TemplateCard({ template, onUse, onPreview, branding }: {
  template: EventTemplate
  onUse: (t: EventTemplate) => void
  onPreview: (id: string | null) => void
  branding: any
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="rounded-2xl border border-brand-divider bg-brand-surface p-5 transition-all hover:border-[var(--org-primary)]/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-surface-elevated flex items-center justify-center" style={{ color: branding.primaryColor }}>
          <LayoutTemplate size={20} />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-text-muted px-2 py-1 rounded-full bg-brand-surface-elevated">
          {TYPE_LABELS[template.type] || template.type}
        </span>
      </div>
      <h3 className="text-sm font-bold text-brand-text-primary mb-1">{template.name}</h3>
      <p className="text-[11px] text-brand-text-muted leading-relaxed mb-4 line-clamp-2">{template.description}</p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-[10px] font-mono text-brand-text-muted">
          <Star size={10} className="text-brand-gold" />
          <span>{template.usedCount} uses</span>
        </div>
        <span className="text-[9px] font-mono text-brand-text-disabled">{template.category}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPreview(template.id)}
          className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border border-brand-border text-brand-text-muted hover:text-brand-text-primary hover:border-brand-text-muted/30 transition-all"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-all"
          style={{ backgroundColor: branding.primaryColor }}
        >
          Use Template
        </button>
      </div>
    </motion.div>
  )
}