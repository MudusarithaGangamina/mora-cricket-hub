# Mora Cricket Hub — .NET Clean Architecture Setup v2.0

---

## Solution Structure

```
src/
├── MoraCricketHub.sln
├── MoraCricketHub.Domain/          # Entities, enums. Zero dependencies.
├── MoraCricketHub.Application/     # Use cases, DTOs, MediatR handlers, interfaces
├── MoraCricketHub.Infrastructure/  # EF Core, repositories, background jobs
└── MoraCricketHub.API/             # Controllers, Program.cs, DI registration
```

---

## Step 1 — Scaffold & References

```bash
cd src
dotnet new sln -n MoraCricketHub
dotnet new classlib -n MoraCricketHub.Domain         -f net8.0
dotnet new classlib -n MoraCricketHub.Application    -f net8.0
dotnet new classlib -n MoraCricketHub.Infrastructure -f net8.0
dotnet new webapi   -n MoraCricketHub.API            -f net8.0
dotnet sln add MoraCricketHub.Domain/MoraCricketHub.Domain.csproj
dotnet sln add MoraCricketHub.Application/MoraCricketHub.Application.csproj
dotnet sln add MoraCricketHub.Infrastructure/MoraCricketHub.Infrastructure.csproj
dotnet sln add MoraCricketHub.API/MoraCricketHub.API.csproj
dotnet add MoraCricketHub.Application/MoraCricketHub.Application.csproj reference MoraCricketHub.Domain/MoraCricketHub.Domain.csproj
dotnet add MoraCricketHub.Infrastructure/MoraCricketHub.Infrastructure.csproj reference MoraCricketHub.Application/MoraCricketHub.Application.csproj
dotnet add MoraCricketHub.API/MoraCricketHub.API.csproj reference MoraCricketHub.Infrastructure/MoraCricketHub.Infrastructure.csproj
dotnet add MoraCricketHub.API/MoraCricketHub.API.csproj reference MoraCricketHub.Application/MoraCricketHub.Application.csproj
```

---

## Step 2 — NuGet Packages

```bash
cd MoraCricketHub.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

cd ../MoraCricketHub.Application
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package AutoMapper

cd ../MoraCricketHub.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
```

---

## Step 3 — Domain Layer

### Folder Structure
```
MoraCricketHub.Domain/
├── Common/
│   └── BaseEntity.cs
├── Enums/
│   ├── BattingStyle.cs
│   ├── BowlingStyle.cs
│   ├── MatchStatus.cs
│   ├── ResultType.cs
│   ├── VenueType.cs
│   ├── RoundType.cs
│   ├── WicketType.cs
│   ├── ExtrasType.cs
│   ├── ShotType.cs
│   ├── DirectionZone.cs
│   ├── CommentaryCoverage.cs
│   ├── BattingRole.cs
│   └── MilestoneType.cs
└── Entities/
    ├── Player.cs
    ├── PlayerSeason.cs          ← NEW: jersey + role per season
    ├── PlayerMilestone.cs       ← NEW: auto-detected career milestones
    ├── Opponent.cs
    ├── OpponentPlayer.cs
    ├── Season.cs
    ├── Tournament.cs
    ├── Venue.cs
    ├── Match.cs
    ├── MatchSquad.cs            ← NEW: explicit playing XI
    ├── Innings.cs
    ├── OverSummary.cs           ← NEW: pre-computed worm chart data
    ├── Delivery.cs
    ├── MoraBattingPerformance.cs
    ├── MoraBowlingPerformance.cs
    ├── MoraFieldingPerformance.cs
    ├── OpponentBattingPerformance.cs
    ├── OpponentBowlingPerformance.cs
    ├── BowlingMilestone.cs      ← NEW: 4-fers, 5-fers, hat-tricks
    ├── FallOfWicket.cs
    ├── Partnership.cs
    └── MoraBattingOrder.cs
```

### Enums/VenueType.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum VenueType { Home, Away, Neutral }
```

### Enums/RoundType.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum RoundType { League, GroupStage, QuarterFinal, SemiFinal, Final, Playoff }
```

### Enums/BattingRole.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum BattingRole { Opener, TopOrder, MiddleOrder, Finisher, Tail }
```

### Enums/MilestoneType.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum MilestoneType
{
    Debut, First30, First50, First100,
    First4Fer, First5Fer, FirstHattrick, FirstMotm
}
```

### Enums/SurfaceType.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum SurfaceType { Matting, Turf }
```

### Enums/BallColour.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum BallColour { Red, White }
```

### Enums/BowlingSide.cs
```csharp
namespace MoraCricketHub.Domain.Enums;
/// <summary>
/// Whether the bowler bowled over or around the wicket.
/// Nullable on Delivery — only populated when commentary explicitly states it.
/// </summary>
public enum BowlingSide { Over, Around }
```

### Enums/MatchStatus.cs (updated)
```csharp
namespace MoraCricketHub.Domain.Enums;
public enum MatchStatus
{
    Completed,
    Abandoned,         // After toss, before play
    AbandonedMid,      // Play started, abandoned mid-match
    NoResult,
    PreTossAbandoned   // Washed out before toss — counts in team records only, NEVER in player stats
}

public enum RoundType
{
    FirstRound, SecondRound, PreQuarterFinal,
    QuarterFinal, SemiFinal, Final, ConsolationFinal,
    GroupStage, League, Playoff
}
```

### Entities/Match.cs
```csharp
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class Match : BaseEntity
{
    public Guid TournamentId { get; set; }
    public Tournament Tournament { get; set; } = null!;
    public Guid OpponentId { get; set; }
    public Opponent Opponent { get; set; } = null!;
    public Guid? VenueId { get; set; }
    public Venue? Venue { get; set; }

    public DateOnly MatchDate { get; set; }
    public int ScheduledOvers { get; set; } = 50;

    // Venue classification — critical for home/away analytics
    public VenueType VenueType { get; set; }
    public RoundType RoundType { get; set; } = RoundType.League;
    public string? RoundLabel { get; set; }

    // Toss
    public string TossWinner { get; set; } = string.Empty; // "MORA" | "OPPONENT"
    public string TossDecision { get; set; } = string.Empty; // "BAT" | "FIELD"
    public bool MoraBattingFirst { get; set; }

    // Result
    public MatchStatus Status { get; set; }
    public ResultType? ResultType { get; set; }
    public int? ResultMargin { get; set; }
    public string? ResultMarginType { get; set; }

    // DLS
    public bool DlsApplied { get; set; }
    public int? DlsTarget { get; set; }
    public int? RevisedOvers { get; set; }

    // Mora officials
    public Guid? MoraCaptainId { get; set; }
    public Player? MoraCaptain { get; set; }
    public Guid? MoraViceCaptainId { get; set; }
    public Player? MoraViceCaptain { get; set; }
    public Guid? MoraWicekeeperId { get; set; }
    public Player? MoraWickekeeper { get; set; }

    // Opponent officials
    public string? OpponentCaptainName { get; set; }
    public string? OpponentViceCaptainName { get; set; }

    // Player of the Match
    public Guid? PlayerOfMatchMoraId { get; set; }
    public Player? PlayerOfMatchMora { get; set; }
    public string? PlayerOfMatchName { get; set; }
    public string? PlayerOfMatchTeam { get; set; } // "MORA" | "OPPONENT"

    public SurfaceType SurfaceType { get; set; } = SurfaceType.Matting;
    public BallColour BallColour { get; set; } = BallColour.Red;
    public string BallType { get; set; } = "LEATHER"; // Material: LEATHER | TAPE | TENNIS

    // Toss — null when PreTossAbandoned
    public bool TossHeld { get; set; } = true;
    // TossWinner, TossDecision, MoraBattingFirst remain nullable strings/bool?

    public string? Notes { get; set; }

    // Navigation
    public ICollection<Innings> Innings { get; set; } = [];
    public ICollection<MatchSquad> Squad { get; set; } = [];
}
```

### Entities/PlayerSeason.cs
```csharp
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class PlayerSeason : BaseEntity
{
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public Guid SeasonId { get; set; }
    public Season Season { get; set; } = null!;
    public int? JerseyNumber { get; set; }
    public BattingRole? BattingRole { get; set; }
}
```

### Entities/PlayerMilestone.cs
```csharp
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class PlayerMilestone : BaseEntity
{
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public MilestoneType MilestoneType { get; set; }
    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;
    public DateOnly AchievedAt { get; set; }
    public string? Detail { get; set; }
}
```

### Entities/MatchSquad.cs
```csharp
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class MatchSquad : BaseEntity
{
    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public bool IsPlayingXi { get; set; } = true;
}
```

### Entities/OverSummary.cs
```csharp
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class OverSummary : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;
    public int OverNumber { get; set; }
    public int RunsInOver { get; set; }
    public int WicketsInOver { get; set; }
    public int DotsInOver { get; set; }
    public int FoursInOver { get; set; }
    public int SixesInOver { get; set; }
    public int WidesInOver { get; set; }
    public int NoBallsInOver { get; set; }
    public int CumulativeRuns { get; set; }    // For worm chart
    public int CumulativeWickets { get; set; }
}
```

### Entities/BowlingMilestone.cs
```csharp
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class BowlingMilestone : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    public string MilestoneType { get; set; } = string.Empty; // FOUR_WICKET | FIVE_WICKET | HATTRICK

    // Hat-trick delivery references
    public Guid? Delivery1Id { get; set; }
    public Delivery? Delivery1 { get; set; }
    public Guid? Delivery2Id { get; set; }
    public Delivery? Delivery2 { get; set; }
    public Guid? Delivery3Id { get; set; }
    public Delivery? Delivery3 { get; set; }

    public string? Detail { get; set; }
}
```

---

## Step 4 — Infrastructure: Background Jobs

Two background jobs run after innings data entry is marked complete.

### Infrastructure/BackgroundJobs/OverSummaryJob.cs
```csharp
using MoraCricketHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MoraCricketHub.Infrastructure.BackgroundJobs;

public class OverSummaryJob
{
    private readonly AppDbContext _db;
    public OverSummaryJob(AppDbContext db) => _db = db;

    public async Task ComputeAsync(Guid inningsId, CancellationToken ct = default)
    {
        // Remove existing summaries for this innings
        var existing = await _db.OverSummaries
            .Where(o => o.InningsId == inningsId).ToListAsync(ct);
        _db.OverSummaries.RemoveRange(existing);

        var deliveries = await _db.Deliveries
            .Where(d => d.InningsId == inningsId)
            .OrderBy(d => d.OverNumber).ThenBy(d => d.DeliverySequence)
            .ToListAsync(ct);

        var grouped = deliveries.GroupBy(d => d.OverNumber).OrderBy(g => g.Key);
        int cumRuns = 0, cumWickets = 0;

        foreach (var over in grouped)
        {
            var balls = over.ToList();
            cumRuns    += balls.Sum(b => b.TotalRuns);
            cumWickets += balls.Count(b => b.IsWicket);

            _db.OverSummaries.Add(new OverSummary
            {
                InningsId         = inningsId,
                OverNumber        = over.Key,
                RunsInOver        = balls.Sum(b => b.TotalRuns),
                WicketsInOver     = balls.Count(b => b.IsWicket),
                DotsInOver        = balls.Count(b => b.RunsOffBat == 0 && b.ExtrasType == null),
                FoursInOver       = balls.Count(b => b.RunsOffBat == 4),
                SixesInOver       = balls.Count(b => b.RunsOffBat == 6),
                WidesInOver       = balls.Count(b => b.ExtrasType?.ToString() == "Wide"),
                NoBallsInOver     = balls.Count(b => b.ExtrasType?.ToString() == "NoBall"),
                CumulativeRuns    = cumRuns,
                CumulativeWickets = cumWickets,
            });
        }

        await _db.SaveChangesAsync(ct);
    }
}
```

### Infrastructure/BackgroundJobs/MilestoneDetectionJob.cs
```csharp
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MoraCricketHub.Infrastructure.BackgroundJobs;

public class MilestoneDetectionJob
{
    private readonly AppDbContext _db;
    public MilestoneDetectionJob(AppDbContext db) => _db = db;

    /// <summary>
    /// IMPORTANT: Always exclude PRE_TOSS_ABANDONED matches from player stats.
    /// These matches count for team records but no XIs were submitted so no player stats apply.
    /// </summary>
    public async Task RunForPlayerAsync(Guid playerId, CancellationToken ct = default)
    {
        // Get all batting performances in chronological order
        var performances = await _db.MoraBattingPerformances
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId
                     && p.DismissalType != "DNB"
                     && p.Innings.Match.Status != MatchStatus.PreTossAbandoned) // CRITICAL filter
            .OrderBy(p => p.Innings.Match.MatchDate)
            .ToListAsync(ct);

        var existing = await _db.PlayerMilestones
            .Where(m => m.PlayerId == playerId).ToListAsync(ct);

        var achieved = existing.Select(m => m.MilestoneType).ToHashSet();

        foreach (var perf in performances)
        {
            var matchDate = perf.Innings.Match.MatchDate;
            var matchId   = perf.Innings.Match.Id;

            TryAdd(MilestoneType.Debut,   achieved, playerId, matchId, matchDate,
                   $"Debut vs {perf.Innings.Match.Opponent?.Name}");

            if (perf.Runs >= 30  && !perf.Innings.Match.MoraBattingFirst == false) // any 30+
                TryAdd(MilestoneType.First30, achieved, playerId, matchId, matchDate,
                       $"{perf.Runs} runs");

            if (perf.Runs >= 50)
                TryAdd(MilestoneType.First50, achieved, playerId, matchId, matchDate,
                       $"{perf.Runs}{(perf.IsNotOut ? "*" : "")} off {perf.BallsFaced} balls");

            if (perf.Runs >= 100)
                TryAdd(MilestoneType.First100, achieved, playerId, matchId, matchDate,
                       $"{perf.Runs}{(perf.IsNotOut ? "*" : "")} off {perf.BallsFaced} balls");

        }

        // Bowling milestones — from bowling performances
        var bowlingPerfs = await _db.MoraBowlingPerformances
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId)
            .OrderBy(p => p.Innings.Match.MatchDate)
            .ToListAsync(ct);

        foreach (var bp in bowlingPerfs)
        {
            if (bp.Wickets >= 4)
                TryAdd(MilestoneType.First4Fer, achieved, playerId,
                       bp.Innings.Match.Id, bp.Innings.Match.MatchDate,
                       $"{bp.Wickets}/{bp.RunsConceded}");
            if (bp.Wickets >= 5)
                TryAdd(MilestoneType.First5Fer, achieved, playerId,
                       bp.Innings.Match.Id, bp.Innings.Match.MatchDate,
                       $"{bp.Wickets}/{bp.RunsConceded}");
        }

        await _db.SaveChangesAsync(ct);
    }

    private void TryAdd(MilestoneType type, HashSet<MilestoneType> achieved,
                        Guid playerId, Guid matchId, DateOnly date, string detail)
    {
        if (achieved.Contains(type)) return;
        achieved.Add(type);
        _db.PlayerMilestones.Add(new PlayerMilestone
        {
            PlayerId      = playerId,
            MilestoneType = type,
            MatchId       = matchId,
            AchievedAt    = date,
            Detail        = detail,
        });
    }
}
```

---

## Step 5 — AppDbContext (updated)

```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<PlayerSeason> PlayerSeasons => Set<PlayerSeason>();
    public DbSet<PlayerMilestone> PlayerMilestones => Set<PlayerMilestone>();
    public DbSet<Opponent> Opponents => Set<Opponent>();
    public DbSet<OpponentPlayer> OpponentPlayers => Set<OpponentPlayer>();
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchSquad> MatchSquads => Set<MatchSquad>();
    public DbSet<Innings> Innings => Set<Innings>();
    public DbSet<OverSummary> OverSummaries => Set<OverSummary>();
    public DbSet<Delivery> Deliveries => Set<Delivery>();
    public DbSet<MoraBattingPerformance> MoraBattingPerformances => Set<MoraBattingPerformance>();
    public DbSet<MoraBowlingPerformance> MoraBowlingPerformances => Set<MoraBowlingPerformance>();
    public DbSet<MoraFieldingPerformance> MoraFieldingPerformances => Set<MoraFieldingPerformance>();
    public DbSet<OpponentBattingPerformance> OpponentBattingPerformances => Set<OpponentBattingPerformance>();
    public DbSet<OpponentBowlingPerformance> OpponentBowlingPerformances => Set<OpponentBowlingPerformance>();
    public DbSet<BowlingMilestone> BowlingMilestones => Set<BowlingMilestone>();
    public DbSet<FallOfWicket> FallOfWickets => Set<FallOfWicket>();
    public DbSet<Partnership> Partnerships => Set<Partnership>();
    public DbSet<MoraBattingOrder> MoraBattingOrders => Set<MoraBattingOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        return base.SaveChangesAsync(ct);
    }
}
```

---

## Step 6 — First Migration

```bash
cd MoraCricketHub.API
dotnet ef migrations add InitialCreate --project ../MoraCricketHub.Infrastructure
dotnet ef database update
```
