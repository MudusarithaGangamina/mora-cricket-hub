using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── Mora players ──────────────────────────────────────────────────────────
    public DbSet<Player> Players => Set<Player>();
    public DbSet<PlayerSeason> PlayerSeasons => Set<PlayerSeason>();
    public DbSet<PlayerMilestone> PlayerMilestones => Set<PlayerMilestone>();

    // ── Opponents ─────────────────────────────────────────────────────────────
    public DbSet<Opponent> Opponents => Set<Opponent>();
    public DbSet<OpponentPlayer> OpponentPlayers => Set<OpponentPlayer>();

    // ── Structure ─────────────────────────────────────────────────────────────
    public DbSet<Season> Seasons => Set<Season>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<Venue> Venues => Set<Venue>();

    // ── Matches ───────────────────────────────────────────────────────────────
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchSquad> MatchSquads => Set<MatchSquad>();
    public DbSet<MatchOpponentSquad> MatchOpponentSquads => Set<MatchOpponentSquad>();

    // ── Innings & deliveries ──────────────────────────────────────────────────
    public DbSet<Innings> Innings => Set<Innings>();
    public DbSet<OverSummary> OverSummaries => Set<OverSummary>();
    public DbSet<Delivery> Deliveries => Set<Delivery>();

    // ── Performances ──────────────────────────────────────────────────────────
    public DbSet<MoraBattingPerformance> MoraBattingPerformances => Set<MoraBattingPerformance>();
    public DbSet<MoraBowlingPerformance> MoraBowlingPerformances => Set<MoraBowlingPerformance>();
    public DbSet<MoraFieldingPerformance> MoraFieldingPerformances => Set<MoraFieldingPerformance>();
    public DbSet<OpponentBattingPerformance> OpponentBattingPerformances => Set<OpponentBattingPerformance>();
    public DbSet<OpponentBowlingPerformance> OpponentBowlingPerformances => Set<OpponentBowlingPerformance>();
    public DbSet<BowlingMilestone> BowlingMilestones => Set<BowlingMilestone>();

    // ── Match detail ──────────────────────────────────────────────────────────
    public DbSet<FallOfWicket> FallOfWickets => Set<FallOfWicket>();
    public DbSet<Partnership> Partnerships => Set<Partnership>();
    public DbSet<MoraBattingOrder> MoraBattingOrders => Set<MoraBattingOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Load all IEntityTypeConfiguration classes from this assembly automatically
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-update UpdatedAt on every save
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
