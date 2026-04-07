using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MoraFieldingPerformanceConfiguration : IEntityTypeConfiguration<MoraFieldingPerformance>
{
    public void Configure(EntityTypeBuilder<MoraFieldingPerformance> builder)
    {
        builder.HasKey(m => m.Id);

        builder.HasOne(m => m.Innings)
            .WithMany(i => i.MoraFieldingPerformances)
            .HasForeignKey(m => m.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Player)
            .WithMany(p => p.FieldingPerformances)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
