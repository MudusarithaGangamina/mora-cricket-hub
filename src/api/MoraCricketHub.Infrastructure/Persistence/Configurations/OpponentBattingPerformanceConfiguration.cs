using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class OpponentBattingPerformanceConfiguration : IEntityTypeConfiguration<OpponentBattingPerformance>
{
    public void Configure(EntityTypeBuilder<OpponentBattingPerformance> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.PlayerName).HasMaxLength(100).IsRequired();
        builder.Property(o => o.BattingStyle).HasMaxLength(5);
        builder.Property(o => o.DismissalType).HasMaxLength(15);

        builder.HasIndex(o => o.InningsId);
        builder.HasIndex(o => o.BattingStyle);

        builder.HasOne(o => o.Innings)
            .WithMany(i => i.OpponentBattingPerformances)
            .HasForeignKey(o => o.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.OpponentPlayer)
            .WithMany()
            .HasForeignKey(o => o.OpponentPlayerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.DismissedByMoraBowler)
            .WithMany()
            .HasForeignKey(o => o.DismissedByMoraBowlerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(o => o.FieldedByMoraPlayer)
            .WithMany()
            .HasForeignKey(o => o.FieldedByMoraPlayerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
