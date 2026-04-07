using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class BowlingMilestoneConfiguration : IEntityTypeConfiguration<BowlingMilestone>
{
    public void Configure(EntityTypeBuilder<BowlingMilestone> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.MilestoneType).HasMaxLength(15).IsRequired();
        builder.Property(b => b.Detail).HasMaxLength(200);

        builder.HasIndex(b => b.PlayerId);
        builder.HasIndex(b => b.MilestoneType);

        builder.HasOne(b => b.Innings)
            .WithMany()
            .HasForeignKey(b => b.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Player)
            .WithMany()
            .HasForeignKey(b => b.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Hat-trick delivery references — all optional
        builder.HasOne(b => b.Delivery1)
            .WithMany()
            .HasForeignKey(b => b.Delivery1Id)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(b => b.Delivery2)
            .WithMany()
            .HasForeignKey(b => b.Delivery2Id)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(b => b.Delivery3)
            .WithMany()
            .HasForeignKey(b => b.Delivery3Id)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
