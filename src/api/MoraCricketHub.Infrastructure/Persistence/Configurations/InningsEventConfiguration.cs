using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class InningsEventConfiguration : IEntityTypeConfiguration<InningsEvent>
{
    public void Configure(EntityTypeBuilder<InningsEvent> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EventType).HasMaxLength(20).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(300).IsRequired();
        builder.Property(e => e.AtOver).HasColumnType("decimal(4,1)");

        builder.HasIndex(e => e.InningsId);
        builder.HasIndex(e => e.EventType);

        builder.HasOne(e => e.Innings)
            .WithMany(i => i.Events)
            .HasForeignKey(e => e.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
