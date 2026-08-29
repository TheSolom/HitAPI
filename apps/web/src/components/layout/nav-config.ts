import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    BookmarkCheck,
    Boxes,
    CreditCard,
    Cpu,
    FileText,
    Gauge,
    Network,
    Plug,
    ShieldCheck,
    Timer,
    Users,
    UserCircle,
    Users2,
} from 'lucide-react';

export interface NavItem {
    label: string;
    to: string;
    icon: LucideIcon;
    disabled?: boolean;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        label: 'Account',
        items: [
            { label: 'Profile', to: '/profile', icon: UserCircle },
            { label: 'Teams', to: '/teams', icon: Users2 },
        ],
    },
    {
        label: 'Monitoring setup',
        items: [
            { label: 'Apps', to: '/apps', icon: Boxes },
            { label: 'Consumers', to: '/consumers', icon: Users },
            { label: 'Endpoints', to: '/endpoints', icon: Network },
        ],
    },
    {
        label: 'Observability',
        items: [
            { label: 'Traffic', to: '/traffic', icon: BarChart3 },
            { label: 'Errors', to: '/errors', icon: AlertTriangle },
            { label: 'Performance', to: '/performance', icon: Gauge },
            { label: 'Resources', to: '/resources', icon: Cpu },
            { label: 'Request logs', to: '/logs', icon: FileText },
        ],
    },
    {
        label: 'Reliability',
        items: [
            { label: 'Alerts', to: '/alerts', icon: Bell },
            { label: 'Uptime', to: '/uptime', icon: Timer },
        ],
    },
    {
        label: 'Workspace',
        items: [
            { label: 'Integrations', to: '/integrations', icon: Plug },
            { label: 'Billing', to: '/billing', icon: CreditCard },
            {
                label: 'Saved filters',
                to: '/saved-filters',
                icon: BookmarkCheck,
            },
            { label: 'Notifications', to: '/notifications', icon: Activity },
            { label: 'Admin', to: '/admin', icon: ShieldCheck },
        ],
    },
];
