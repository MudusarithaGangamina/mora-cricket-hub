using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MoraBattingOrderConfiguration : IEntityTypeConfiguration<MoraBattingOrder>
{
    public void Configure(EntityTypeBuilder<MoraBattingOrder> builder)
    {
        builder.HasKey(m => m.Id);
        builder.HasIndex(m => new { m.InningsId, m.Position }).IsUnique();
        builder.HasIndex(m => new { m.InningsId, m.PlayerId }).IsUnique();

        builder.HasOne(m => m.Innings)
            .WithMany()
            .HasForeignKey(m => m.InningsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Player)
            .WithMany()
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
