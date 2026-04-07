using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class DeliveryConfiguration : IEntityTypeConfiguration<Delivery>
{
    public void Configure(EntityTypeBuilder<Delivery> builder)
    {
        builder.HasKey(d => d.Id);

        builder.Property(d => d.OppBatterName).HasMaxLength(100);
        builder.Property(d => d.OppBatterStyle).HasMaxLength(5);
        builder.Property(d => d.OppBowlerName).HasMaxLength(100);
        builder.Property(d => d.OppBowlerStyle).HasMaxLength(5);
        builder.Property(d => d.DismissedBatterName).HasMaxLength(100);
        builder.Property(d => d.OppFielderName).HasMaxLength(100);
        builder.Property(d => d.ExtrasType).HasConversion<string>();
        builder.Property(d => d.WicketType).HasConversion<string>();
        builder.Property(d => d.BowlingSide).HasConversion<string>();
        builder.Property(d => d.ShotType).HasConversion<string>();
        builder.Property(d => d.DirectionZone).HasConversion<string>();

        // Primary analytics indexes
        builder.HasIndex(d => d.InningsId);
        builder.HasIndex(d => d.MoraBatterId);
        builder.HasIndex(d => d.MoraBowlerId);
        builder.HasIndex(d => d.OppBowlerStyle);    // Batter vs bowling style
        builder.HasIndex(d => d.OppBatterStyle);    // Bowler vs batter hand
        builder.HasIndex(d => d.IsWicket);
        builder.HasIndex(d => d.MoraFielderId);
        builder.HasIndex(d => new { d.InningsId, d.OverNumber, d.DeliverySequence }).IsUnique();

        builder.HasOne(d => d.Innings)
            .WithMany(i => i.Deliveries)
            .HasForeignKey(d => d.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        // Multiple FKs to Player — all NoAction to prevent cascade cycles
        builder.HasOne(d => d.MoraBatter)
            .WithMany()
            .HasForeignKey(d => d.MoraBatterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.MoraBowler)
            .WithMany()
            .HasForeignKey(d => d.MoraBowlerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.DismissedMoraBatter)
            .WithMany()
            .HasForeignKey(d => d.DismissedMoraBatterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.MoraFielder)
            .WithMany()
            .HasForeignKey(d => d.MoraFielderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.OppBatter)
            .WithMany()
            .HasForeignKey(d => d.OppBatterId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.OppBowler)
            .WithMany()
            .HasForeignKey(d => d.OppBowlerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(d => d.DismissedOppBatter)
            .WithMany()
            .HasForeignKey(d => d.DismissedOppBatterId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
