var INSTRUCTION_PTR = Module.getBaseAddress(LIB_SO).add(REAL_INSTRUCTION_ADDR);
Memory.protect(INSTRUCTION_PTR, 0x1000, "rwx");
var WRITER = new X86Writer(INSTRUCTION_PTR);
var INSTRUCTION_PTR = Module.getBaseAddress(LIB_SO).add(REAL_INSTRUCTION_ADDR);
Memory.protect(INSTRUCTION_PTR, 0x1000, "rwx");
var WRITER = new Arm64Writer(INSTRUCTION_PTR);
try
{
/* Usefull links
X86   - Usefull link: https:		ARM64 - Usefull link: https:	*/
WRITER.flush();
} 
finally 
{
WRITER.dispose();
}
