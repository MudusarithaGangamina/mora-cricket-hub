using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class PartnershipConfiguration : IEntityTypeConfiguration<Partnership>
{
    public void Configure(EntityTypeBuilder<Partnership> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.OppBatter1Name).HasMaxLength(100);
        builder.Property(p => p.OppBatter2Name).HasMaxLength(100);

        builder.HasIndex(p => p.InningsId);
        builder.HasIndex(p => new { p.MoraBatter1Id, p.MoraBatter2Id });

        builder.HasOne(p => p.Innings)
            .WithMany(i => i.Partnerships)
            .HasForeignKey(p => p.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.MoraBatter1)
            .WithMany()
            .HasForeignKey(p => p.MoraBatter1Id)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(p => p.MoraBatter2)
            .WithMany()
            .HasForeignKey(p => p.MoraBatter2Id)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(p => p.OppBatter1)
            .WithMany()
            .HasForeignKey(p => p.OppBatter1Id)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(p => p.OppBatter2)
            .WithMany()
            .HasForeignKey(p => p.OppBatter2Id)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
