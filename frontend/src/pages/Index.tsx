// import { FileText, CheckCircle, Clock, XCircle, Vote, TrendingUp, AlertTriangle, MessageCircle } from "lucide-react";
// import { StatCard } from "@/components/StatCard";
// import { StatusBadge } from "@/components/StatusBadge";
// import { petitions, polls } from "@/data/mockData";
// import { Link } from "react-router-dom";

// const activePetitions = petitions.filter((p) => p.status === "active");
// const underReview = petitions.filter((p) => p.status === "under-review");
// const closed = petitions.filter((p) => p.status === "closed");
// const trending = [...petitions].sort((a, b) => b.signatures - a.signatures).slice(0, 5);
// const urgent = petitions.filter((p) => p.signatures >= p.target && p.status === "active");
// const pendingResponse = petitions.filter((p) => !p.officialResponse && p.status !== "closed");
// const totalCitizens = 24500;
// const participated = petitions.reduce((sum, p) => sum + p.signatures, 0);
// const engagementRate = Math.round((participated / totalCitizens) * 100);

// const Index = () => {
//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div>
//         <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h1>
//         <p className="text-muted-foreground text-sm mt-1">Monitor civic engagement across your area</p>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//         <StatCard title="Total Petitions" value={petitions.length} icon={FileText} variant="primary" />
//         <StatCard title="Active" value={activePetitions.length} icon={CheckCircle} variant="success" trend="+2 this week" trendUp />
//         <StatCard title="Under Review" value={underReview.length} icon={Clock} variant="warning" />
//         <StatCard title="Closed" value={closed.length} icon={XCircle} variant="default" />
//         <StatCard title="Total Polls" value={polls.length} icon={Vote} variant="info" />
//         <StatCard title="Engagement" value={`${engagementRate}%`} icon={TrendingUp} variant="primary" trend="+5%" trendUp />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Trending Petitions */}
//         <div className="glass-card p-5 lg:col-span-2">
//           <div className="flex items-center gap-2 mb-4">
//             <TrendingUp className="h-4 w-4 text-primary" />
//             <h2 className="font-heading font-semibold text-foreground">Trending Petitions</h2>
//           </div>
//           <div className="space-y-3">
//             {trending.map((p, i) => (
//               <Link
//                 key={p.id}
//                 to={`/petitions/${p.id}`}
//                 className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
//               >
//                 <div className="flex items-center gap-3 min-w-0">
//                   <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
//                     <p className="text-xs text-muted-foreground">{p.location}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 shrink-0">
//                   <StatusBadge status={p.status} />
//                   <span className="text-sm font-semibold text-foreground">{p.signatures.toLocaleString()}</span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Side panels */}
//         <div className="space-y-6">
//           {/* Urgent Issues */}
//           <div className="glass-card p-5">
//             <div className="flex items-center gap-2 mb-4">
//               <AlertTriangle className="h-4 w-4 text-warning" />
//               <h2 className="font-heading font-semibold text-foreground">Urgent Issues</h2>
//             </div>
//             {urgent.length === 0 ? (
//               <p className="text-sm text-muted-foreground">No urgent issues</p>
//             ) : (
//               <div className="space-y-2">
//                 {urgent.map((p) => (
//                   <Link key={p.id} to={`/petitions/${p.id}`} className="block p-3 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors">
//                     <p className="text-sm font-medium text-foreground">{p.title}</p>
//                     <p className="text-xs text-warning mt-1">⚠ Target exceeded: {p.signatures.toLocaleString()}/{p.target.toLocaleString()}</p>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Pending Response */}
//           <div className="glass-card p-5">
//             <div className="flex items-center gap-2 mb-4">
//               <MessageCircle className="h-4 w-4 text-info" />
//               <h2 className="font-heading font-semibold text-foreground">Pending Response</h2>
//               <span className="ml-auto text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">{pendingResponse.length}</span>
//             </div>
//             <div className="space-y-2">
//               {pendingResponse.slice(0, 3).map((p) => (
//                 <Link key={p.id} to={`/petitions/${p.id}`} className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
//                   <p className="text-sm font-medium text-foreground">{p.title}</p>
//                   <p className="text-xs text-muted-foreground mt-1">{p.signatures.toLocaleString()} signatures</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Index;
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Vote,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { petitions, polls } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const activePetitions = petitions.filter((p) => p.status === "active");
const underReview = petitions.filter((p) => p.status === "under-review");
const closed = petitions.filter((p) => p.status === "closed");
const trending = [...petitions]
  .sort((a, b) => b.signatures - a.signatures)
  .slice(0, 5);
const urgent = petitions.filter(
  (p) => p.signatures >= p.target && p.status === "active"
);
const pendingResponse = petitions.filter(
  (p) => !p.officialResponse && p.status !== "closed"
);

const totalCitizens = 24500;
const participated = petitions.reduce(
  (sum, p) => sum + p.signatures,
  0
);
const engagementRate = Math.round(
  (participated / totalCitizens) * 100
);

const Index = () => {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor civic engagement across your area
          </p>
        </div>

        <Link to="/petitions/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Petition
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Petitions"
          value={petitions.length}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Active"
          value={activePetitions.length}
          icon={CheckCircle}
          variant="success"
          trend="+2 this week"
          trendUp
        />
        <StatCard
          title="Under Review"
          value={underReview.length}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Closed"
          value={closed.length}
          icon={XCircle}
          variant="default"
        />
        <StatCard
          title="Total Polls"
          value={polls.length}
          icon={Vote}
          variant="info"
        />
        <StatCard
          title="Engagement"
          value={`${engagementRate}%`}
          icon={TrendingUp}
          variant="primary"
          trend="+5%"
          trendUp
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Trending Petitions */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">
              Trending Petitions
            </h2>
          </div>

          <div className="space-y-3">
            {trending.map((p, i) => (
              <Link
                key={p.id}
                to={`/petitions/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={p.status} />
                  <span className="text-sm font-semibold text-foreground">
                    {p.signatures.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Panels */}
        <div className="space-y-6">

          {/* Urgent Issues */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h2 className="font-heading font-semibold text-foreground">
                Urgent Issues
              </h2>
            </div>

            {urgent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No urgent issues
              </p>
            ) : (
              <div className="space-y-2">
                {urgent.map((p) => (
                  <Link
                    key={p.id}
                    to={`/petitions/${p.id}`}
                    className="block p-3 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {p.title}
                    </p>
                    <p className="text-xs text-warning mt-1">
                      ⚠ Target exceeded:{" "}
                      {p.signatures.toLocaleString()}/
                      {p.target.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending Response */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-4 w-4 text-info" />
              <h2 className="font-heading font-semibold text-foreground">
                Pending Response
              </h2>
              <span className="ml-auto text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">
                {pendingResponse.length}
              </span>
            </div>

            <div className="space-y-2">
              {pendingResponse.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={`/petitions/${p.id}`}
                  className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.signatures.toLocaleString()} signatures
                  </p>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;