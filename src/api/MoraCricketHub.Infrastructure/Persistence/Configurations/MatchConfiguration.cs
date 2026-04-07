using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.VenueType).HasConversion<string>().HasMaxLength(10);
        builder.Property(m => m.SurfaceType).HasConversion<string>().HasMaxLength(10);
        builder.Property(m => m.BallColour).HasConversion<string>().HasMaxLength(5);
        builder.Property(m => m.BallType).HasConversion<string>().HasMaxLength(10);
        builder.Property(m => m.RoundType).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.RoundLabel).HasMaxLength(50);
        builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(25);
        builder.Property(m => m.ResultType).HasConversion<string>().HasMaxLength(15);
        builder.Property(m => m.ResultMarginType).HasMaxLength(10);
        builder.Property(m => m.TossWinner).HasMaxLength(10);
        builder.Property(m => m.TossDecision).HasMaxLength(5);
        builder.Property(m => m.OpponentCaptainName).HasMaxLength(100);
        builder.Property(m => m.PlayerOfMatchName).HasMaxLength(100);
        builder.Property(m => m.PlayerOfMatchTeam).HasMaxLength(10);

        // Indexes critical for analytics queries
        builder.HasIndex(m => m.MatchDate);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.ResultType);
        builder.HasIndex(m => m.VenueType);
        builder.HasIndex(m => m.MoraCaptainId);
        builder.HasIndex(m => m.MoraBattingFirst);
        builder.HasIndex(m => m.TournamentId);
        builder.HasIndex(m => m.OpponentId);

        builder.HasOne(m => m.Tournament)
            .WithMany(t => t.Matches)
            .HasForeignKey(m => m.TournamentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Opponent)
            .WithMany(o => o.Matches)
            .HasForeignKey(m => m.OpponentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Venue)
            .WithMany(v => v.Matches)
            .HasForeignKey(m => m.VenueId)
            .OnDelete(DeleteBehavior.SetNull);

        // Self-referencing FKs to Player — must use NoAction to avoid cascade cycles
        builder.HasOne(m => m.MoraCaptain)
            .WithMany()
            .HasForeignKey(m => m.MoraCaptainId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(m => m.MoraWickekeeper)
            .WithMany()
            .HasForeignKey(m => m.MoraWickeeperId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(m => m.PlayerOfMatchMora)
            .WithMany()
            .HasForeignKey(m => m.PlayerOfMatchMoraId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
