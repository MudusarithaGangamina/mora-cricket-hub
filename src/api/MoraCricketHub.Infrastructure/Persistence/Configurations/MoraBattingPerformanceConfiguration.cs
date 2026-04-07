using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MoraBattingPerformanceConfiguration : IEntityTypeConfiguration<MoraBattingPerformance>
{
    public void Configure(EntityTypeBuilder<MoraBattingPerformance> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.DismissalType).HasMaxLength(15);
        builder.Property(m => m.DismissedByOppBowlerName).HasMaxLength(100);
        builder.Property(m => m.DismissedByOppBowlerStyle).HasMaxLength(5);
        builder.Property(m => m.FieldedByOppName).HasMaxLength(100);

        // Critical index for batter vs bowling style when no delivery data exists
        builder.HasIndex(m => m.DismissedByOppBowlerStyle);
        builder.HasIndex(m => m.PlayerId);
        builder.HasIndex(m => m.InningsId);

        builder.HasOne(m => m.Innings)
            .WithMany(i => i.MoraBattingPerformances)
            .HasForeignKey(m => m.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Player)
            .WithMany(p => p.BattingPerformances)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.DismissedByOppBowler)
            .WithMany()
            .HasForeignKey(m => m.DismissedByOppBowlerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(m => m.FieldedByMoraPlayer)
            .WithMany()
            .HasForeignKey(m => m.FieldedByMoraPlayerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
