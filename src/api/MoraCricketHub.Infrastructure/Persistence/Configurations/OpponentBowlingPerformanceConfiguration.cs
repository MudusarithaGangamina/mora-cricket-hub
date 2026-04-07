using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class OpponentBowlingPerformanceConfiguration : IEntityTypeConfiguration<OpponentBowlingPerformance>
{
    public void Configure(EntityTypeBuilder<OpponentBowlingPerformance> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.PlayerName).HasMaxLength(100).IsRequired();
        builder.Property(o => o.BowlingStyle).HasMaxLength(5);
        builder.Property(o => o.OversBowled).HasColumnType("decimal(4,1)");

        builder.HasIndex(o => o.InningsId);
        builder.HasIndex(o => o.BowlingStyle);

        builder.HasOne(o => o.Innings)
            .WithMany(i => i.OpponentBowlingPerformances)
            .HasForeignKey(o => o.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.OpponentPlayer)
            .WithMany()
            .HasForeignKey(o => o.OpponentPlayerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}