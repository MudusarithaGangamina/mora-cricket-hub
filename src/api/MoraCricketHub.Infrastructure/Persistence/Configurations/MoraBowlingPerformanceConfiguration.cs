using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MoraBowlingPerformanceConfiguration : IEntityTypeConfiguration<MoraBowlingPerformance>
{
    public void Configure(EntityTypeBuilder<MoraBowlingPerformance> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.OversBowled).HasColumnType("decimal(4,1)");

        builder.HasIndex(m => m.PlayerId);
        builder.HasIndex(m => m.InningsId);
        builder.HasIndex(m => m.IsFiveWicketHaul);

        builder.HasOne(m => m.Innings)
            .WithMany(i => i.MoraBowlingPerformances)
            .HasForeignKey(m => m.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Player)
            .WithMany(p => p.BowlingPerformances)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
