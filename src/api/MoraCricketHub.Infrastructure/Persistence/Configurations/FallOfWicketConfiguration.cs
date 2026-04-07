using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class FallOfWicketConfiguration : IEntityTypeConfiguration<FallOfWicket>
{
    public void Configure(EntityTypeBuilder<FallOfWicket> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.DismissedPlayerName).HasMaxLength(100).IsRequired();
        builder.Property(f => f.OverAtFall).HasColumnType("decimal(4,1)");
        builder.HasIndex(f => f.InningsId);
        builder.HasIndex(f => new { f.InningsId, f.WicketNumber }).IsUnique();

        builder.HasOne(f => f.Innings)
            .WithMany(i => i.FallOfWickets)
            .HasForeignKey(f => f.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.DismissedMoraPlayer)
            .WithMany()
            .HasForeignKey(f => f.DismissedMoraPlayerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(f => f.DismissedOppPlayer)
            .WithMany()
            .HasForeignKey(f => f.DismissedOppPlayerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
